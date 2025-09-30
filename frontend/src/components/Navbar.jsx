import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessagesSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full z-40 top-0 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-0">
            <Link
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
              to="/"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center">
                <MessagesSquare className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-xl font-serif font-bold">Chatosi</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className={`btn btn-sm gap-2 transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            {authUser && (
              <>
                <Link
                  to={"/profile"}
                  className="btn btn-sm btn-ghost normal-case"
                >
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
