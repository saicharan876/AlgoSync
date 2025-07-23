import Avatar from "react-avatar";
import "./Client.css"; // add this for custom styles below

function Client({ username }) {
  return (
    <div className="client">
      <Avatar
        name={username?.toString()}
        size="40"
        round={true}
        className="client-avatar"
      />
      <span className="client-username">{username?.toString()}</span>
    </div>
  );
}

export default Client;
