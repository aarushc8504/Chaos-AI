import React from "react";

import {
  Brain,
  Home,
  Library,
  MessageSquare,
  Layers,
  ClipboardCheck,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar({
  activePage,
  setActivePage,
  user,
}) {
  const items = [
    {
      name: "Dashboard",
      icon: Home,
    },
    {
      name: "Study Workspace",
      icon: MessageSquare,
    },
    {
      name: "My Library",
      icon: Library,
    },
    {
      name: "Flashcards",
      icon: Layers,
    },
    {
      name: "MCQs",
      icon: ClipboardCheck,
    },
    {
      name: "Study Plan",
      icon: CalendarDays,
    },
    {
      name: "Analytics",
      icon: BarChart3,
    },
  ];

  const logout = async () => {
    try {
      await fetch(
        "http://localhost:5000/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-zinc-800 bg-[#0b0d0f] p-5 md:block">

      <div className="flex items-center gap-3 px-2">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black">
          <Brain size={18} />
        </div>

        <div className="min-w-0">

          <div className="text-sm font-semibold tracking-wide">
            CHAOS AI
          </div>

          <div className="truncate text-[10px] text-zinc-600">
            Learn with your material
          </div>

        </div>

      </div>

      <div className="mt-10">

        <p className="px-3 text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
          STUDY
        </p>

        <div className="mt-3 space-y-1">

          {items.map((item) => {

            const Icon = item.icon;

            const active =
              activePage === item.name;

            return (
              <button
                key={item.name}
                onClick={() =>
                  setActivePage(
                    item.name
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >

                <Icon
                  size={17}
                  className="shrink-0"
                />

                <span className="truncate">
                  {item.name}
                </span>

              </button>
            );
          })}

        </div>

      </div>

      <div className="absolute bottom-5 left-5 right-5">

        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">

            {user.picture ? (
              <img
                src={user.picture}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs">
                {user.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0">

              <p className="truncate text-xs font-medium text-zinc-300">
                {user.name}
              </p>

              <p className="truncate text-[10px] text-zinc-600">
                {user.email}
              </p>

            </div>

          </div>
        )}

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-300"
        >

          <LogOut
            size={17}
            className="shrink-0"
          />

          Log out

        </button>

        <button
          onClick={() =>
            setActivePage(
              "Settings"
            )
          }
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-300"
        >

          <Settings
            size={17}
            className="shrink-0"
          />

          Settings

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;