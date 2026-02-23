import { useAuthStore } from "../store/useAuthStore";

const ChatPage = () => {
  const { logout } = useAuthStore();

  return (
    <div className="z-10">
      ChatPage
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-md mt-4 cursor-pointer"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

export default ChatPage;
