import "dotenv/config";

import express from "express";
import multer from "multer";
import crypto from "crypto";

import {
  BlobServiceClient,
} from "@azure/storage-blob";

import {
  PDFDocument,
} from "pdf-lib";

import Material from "../../models/Material.js";

import {
  analyzeDocument,
} from "../services/documentIntelligence.js";

import {
  createEmbeddings,
} from "../services/embedding.js";

import {
  chunkPages,
} from "../services/chunking.js";

import {
  indexChunks,
  deleteMaterialFromSearch,
} from "../services/search.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ];

    if (
      !allowedTypes.includes(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          "Only PDF, PNG and JPG/JPEG files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

const blobServiceClient =
  BlobServiceClient.fromConnectionString(
    process.env
      .AZURE_STORAGE_CONNECTION_STRING
  );

const containerName =
  "study-materials";

function calculateFileHash(
  buffer
) {
  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");
}

function buildPagesFromAnalyzeResult(
  analyzeResult
) {
  if (
    !analyzeResult?.pages ||
    !Array.isArray(
      analyzeResult.pages
    )
  ) {
    return [];
  }

  return analyzeResult.pages
    .map(
      (
        page,
        pageIndex
      ) => {
        const lines =
          Array.isArray(
            page.lines
          )
            ? page.lines
            : [];

        const text =
          lines
            .map(
              (line) =>
                line.content ||
                ""
            )
            .join("\n")
            .trim();

        return {
          pageNumber:
            page.pageNumber ||
            pageIndex + 1,

          text,
        };
      }
    )
    .filter(
      (page) => page.text
    );
}

async function getPdfPageCount(
  buffer
) {
  const pdf =
    await PDFDocument.load(
      buffer
    );

  return pdf.getPageCount();
}

async function processMaterial({
  material,
  buffer,
  contentType,
  userId,
}) {
  try {
    console.log(
      `Starting Document Intelligence: ${material.originalName}`
    );

    console.log(
      `Material ID: ${material._id}`
    );

    console.log(
      `File hash: ${material.fileHash}`
    );

    console.log(
      `Actual uploaded file size: ${(
        buffer.length /
        1024
      ).toFixed(2)} KB`
    );

    if (
      contentType ===
      "application/pdf"
    ) {
      try {
        const actualPageCount =
          await getPdfPageCount(
            buffer
          );

        console.log(
          `PDF pages in uploaded bytes: ${actualPageCount}`
        );
      } catch (
        pdfError
      ) {
        console.error(
          "Could not inspect PDF page count:",
          pdfError.message
        );
      }
    }

    const analyzeResult =
      await analyzeDocument(
        buffer,
        contentType
      );

    const extractedText =
      analyzeResult?.content ||
      "";

    const pages =
      buildPagesFromAnalyzeResult(
        analyzeResult
      );

    console.log(
      `Document Intelligence complete: ${material.originalName}`
    );

    console.log(
      `Extracted characters: ${extractedText.length}`
    );

    console.log(
      `Pages detected: ${pages.length}`
    );

    if (
      pages.length === 0 &&
      extractedText
    ) {
      pages.push({
        pageNumber: 1,
        text: extractedText,
      });
    }

    const chunks =
      chunkPages(pages);

    console.log(
      `Chunks created: ${chunks.length}`
    );

    if (
      chunks.length === 0
    ) {
      throw new Error(
        "No text could be extracted from the document."
      );
    }

    const batchSize = 16;

    let totalIndexed = 0;

    for (
      let start = 0;
      start <
      chunks.length;
      start += batchSize
    ) {
      const batch =
        chunks.slice(
          start,
          start +
            batchSize
        );

      console.log(
        `Creating embeddings for chunks ${start + 1}-${start + batch.length} of ${chunks.length}`
      );

      const embeddings =
        await createEmbeddings(
          batch.map(
            (chunk) =>
              chunk.content
          )
        );

      const indexed =
        await indexChunks({
          materialId:
            material._id,

          userId,

          fileName:
            material.originalName,

          chunks: batch,

          embeddings,
        });

      totalIndexed +=
        indexed.count;

      console.log(
        `Indexed ${indexed.count} chunks`
      );
    }

    await Material.findByIdAndUpdate(
      material._id,
      {
        extractedText,
        status: "ready",
      }
    );

    console.log(
      "========================================"
    );

    console.log(
      `MATERIAL READY: ${material.originalName}`
    );

    console.log(
      `Total chunks indexed: ${totalIndexed}`
    );

    console.log(
      "========================================"
    );
  } catch (
    processingError
  ) {
    console.error(
      `Processing failed for ${material.originalName}:`,
      processingError
    );

    await Material.findByIdAndUpdate(
      material._id,
      {
        status: "failed",
      }
    );
  }
}

router.post(
  "/upload",
  upload.single("file"),
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.session.user
      ) {
        return res
          .status(401)
          .json({
            message:
              "You must be logged in to upload files.",
          });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({
            message:
              "No file was uploaded.",
          });
      }

      const userId =
        req.session.user.id;

      const fileBuffer =
        req.file.buffer;

      const fileHash =
        calculateFileHash(
          fileBuffer
        );

      console.log(
        "========================================"
      );

      console.log(
        "NEW MATERIAL UPLOAD"
      );

      console.log(
        "========================================"
      );

      console.log(
        "File:",
        req.file.originalname
      );

      console.log(
        "Size:",
        req.file.size
      );

      console.log(
        "SHA-256:",
        fileHash
      );

      const existingMaterial =
        await Material.findOne({
          userId,
          fileHash,
        });

      if (
        existingMaterial
      ) {
        console.log(
          "DUPLICATE MATERIAL DETECTED"
        );

        console.log(
          "Existing material:",
          existingMaterial.originalName
        );

        console.log(
          "Existing material ID:",
          existingMaterial._id
        );

        console.log(
          "Existing status:",
          existingMaterial.status
        );

        console.log(
          "Skipping Blob upload and processing."
        );

        console.log(
          "========================================"
        );

        return res.status(200).json({
          message:
            "This exact file has already been uploaded.",

          duplicate: true,

          material: {
            id:
              existingMaterial._id,

            name:
              existingMaterial.originalName,

            size:
              existingMaterial.size,

            contentType:
              existingMaterial.contentType,

            status:
              existingMaterial.status,
          },
        });
      }

      const safeFileName =
        req.file.originalname.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

      const blobName =
        `${userId}/${Date.now()}-${safeFileName}`;

      const containerClient =
        blobServiceClient.getContainerClient(
          containerName
        );

      const blockBlobClient =
        containerClient.getBlockBlobClient(
          blobName
        );

      await blockBlobClient.uploadData(
        fileBuffer,
        {
          blobHTTPHeaders: {
            blobContentType:
              req.file.mimetype,
          },
        }
      );

      let material;

      try {
        material =
          await Material.create({
            userId,

            originalName:
              req.file.originalname,

            fileHash,

            blobName,

            containerName,

            contentType:
              req.file.mimetype,

            size:
              req.file.size,

            status:
              "processing",
          });
      } catch (
        databaseError
      ) {
        if (
          databaseError?.code ===
          11000
        ) {
          const duplicate =
            await Material.findOne({
              userId,
              fileHash,
            });

          if (
            duplicate
          ) {
            console.log(
              "Duplicate detected during concurrent upload."
            );

            try {
              await blockBlobClient.deleteIfExists();
            } catch (
              deleteError
            ) {
              console.error(
                "Could not remove duplicate blob:",
                deleteError.message
              );
            }

            return res
              .status(200)
              .json({
                message:
                  "This exact file has already been uploaded.",

                duplicate: true,

                material: {
                  id:
                    duplicate._id,

                  name:
                    duplicate.originalName,

                  size:
                    duplicate.size,

                  contentType:
                    duplicate.contentType,

                  status:
                    duplicate.status,
                },
              });
          }
        }

        throw databaseError;
      }

      res.status(201).json({
        message:
          "File uploaded and processing started.",

        duplicate: false,

        material: {
          id:
            material._id,

          name:
            material.originalName,

          size:
            material.size,

          contentType:
            material.contentType,

          status:
            material.status,
        },
      });

      processMaterial({
        material,

        buffer:
          fileBuffer,

        contentType:
          req.file.mimetype,

        userId,
      });
    } catch (
      error
    ) {
      console.error(
        "File upload error:",
        error
      );

      if (
        !res.headersSent
      ) {
        res
          .status(500)
          .json({
            message:
              "File upload failed.",
          });
      }
    }
  }
);

router.get(
  "/",
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.session.user
      ) {
        return res
          .status(401)
          .json({
            message:
              "You must be logged in.",
          });
      }

      const materials =
        await Material.find({
          userId:
            req.session.user.id,
        }).sort({
          createdAt: -1,
        });

      res.json({
        materials,
      });
    } catch (
      error
    ) {
      console.error(
        "Fetching materials failed:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Failed to fetch materials.",
        });
    }
  }
);

router.delete(
  "/:id",
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.session.user
      ) {
        return res
          .status(401)
          .json({
            message:
              "You must be logged in.",
          });
      }

      const materialId =
        req.params.id;

      const userId =
        req.session.user.id;

      const material =
        await Material.findOne({
          _id: materialId,
          userId,
        });

      if (!material) {
        return res
          .status(404)
          .json({
            message:
              "Material not found.",
          });
      }

      console.log(
        "========================================"
      );

      console.log(
        "DELETING MATERIAL"
      );

      console.log(
        "========================================"
      );

      console.log(
        "Material:",
        material.originalName
      );

      console.log(
        "Material ID:",
        material._id.toString()
      );

      console.log(
        "User ID:",
        userId.toString()
      );

      let searchDeleted = 0;

      try {
        const searchResult =
          await deleteMaterialFromSearch(
            material._id.toString()
          );

        searchDeleted =
          searchResult.count;

        console.log(
          `Azure AI Search chunks deleted: ${searchDeleted}`
        );
      } catch (
        searchError
      ) {
        console.error(
          "Azure AI Search deletion failed:",
          searchError
        );

        return res
          .status(500)
          .json({
            message:
              "Could not remove the material from Azure AI Search. The material was not deleted.",
          });
      }

      let blobDeleted = false;

      if (
        material.blobName
      ) {
        try {
          const materialContainerName =
            material.containerName ||
            containerName;

          const materialContainerClient =
            blobServiceClient.getContainerClient(
              materialContainerName
            );

          const blockBlobClient =
            materialContainerClient.getBlockBlobClient(
              material.blobName
            );

          blobDeleted =
            await blockBlobClient.deleteIfExists();

          console.log(
            `Azure Blob deleted: ${blobDeleted}`
          );
        } catch (
          blobError
        ) {
          console.error(
            "Azure Blob deletion failed:",
            blobError
          );

          return res
            .status(500)
            .json({
              message:
                "Could not remove the material file from Azure Storage. The material was not deleted.",
            });
        }
      }

      await Material.deleteOne({
        _id: material._id,
        userId,
      });

      console.log(
        "MongoDB material deleted successfully."
      );

      console.log(
        "========================================"
      );

      console.log(
        "MATERIAL DELETED SUCCESSFULLY"
      );

      console.log(
        "========================================"
      );

      return res.status(200).json({
        success: true,

        message:
          "Material deleted successfully.",

        deleted: {
          materialId:
            material._id,

          name:
            material.originalName,

          searchChunks:
            searchDeleted,

          blob:
            blobDeleted,
        },
      });
    } catch (
      error
    ) {
      console.error(
        "Deleting material failed:",
        error
      );

      if (
        error?.name ===
        "CastError"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid material ID.",
          });
      }

      return res
        .status(500)
        .json({
          message:
            "Failed to delete material.",
        });
    }
  }
);

export default router;