import { useEffect, useState } from "react";

const Players = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/players")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched players:", data); // Debugging step
        setPlayers(Array.isArray(data) ? data : []); // Ensure data is an array
      })
      .catch((error) => console.error("Error fetching players:", error));
  }, []);

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.username} - Gold: {player.gold} - Health: {player.health}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Players;
