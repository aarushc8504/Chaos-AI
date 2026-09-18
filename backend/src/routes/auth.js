import "dotenv/config";
import express from "express";
import crypto from "crypto";
import { google } from "googleapis";
import User from "../../models/User.js";

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get("/google", (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  req.session.oauthState = state;

  req.session.save((sessionError) => {
    if (sessionError) {
      console.error("OAuth session save error:", sessionError);
      return res.status(500).send("Failed to start Google authentication.");
    }

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "select_account",
    });

    res.redirect(authorizationUrl);
  });
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send("Missing OAuth code or state.");
    }

    if (state !== req.session.oauthState) {
      return res.status(403).send("Invalid OAuth state.");
    }

    delete req.session.oauthState;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    let user = await User.findOne({
      googleId: data.id,
    });

    if (!user) {
      user = await User.create({
        googleId: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture || "",
      });

      console.log("New user created:", user.email);
    } else {
      user.name = data.name;
      user.email = data.email;
      user.picture = data.picture || "";

      await user.save();

      console.log("Existing user logged in:", user.email);
    }

    req.session.user = {
      id: user._id.toString(),
      googleId: user.googleId,
      name: user.name,
      email: user.email,
      picture: user.picture,
    };

    req.session.save((sessionError) => {
      if (sessionError) {
        console.error("Login session save error:", sessionError);
        return res.status(500).send("Failed to save login session.");
      }

      console.log("Login session saved successfully:", user.email);

      res.redirect(`${process.env.FRONTEND_URL}/workspace`);
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).send("Google authentication failed.");
  }
});

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      authenticated: false,
    });
  }

  res.json({
    authenticated: true,
    user: req.session.user,
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed",
      });
    }

    res.clearCookie("chaos.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      message: "Logged out successfully",
    });
  });
});

export default router;