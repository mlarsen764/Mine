import { useState } from "react";

const playerStatus = () => {
    const [playerGold, setPlayerGold] = useState(0);
    const [playerAllies, setPlayerAllies] = useState([]);
    const [playerItems, setPlayerItems] = useState([]);

    const addGold = (amount) => {
        setPlayerGold((prevGold) => prevGold + amount);
    };

    const addAlly = (allyType) => {
        setPlayerAllies((prevAllies) => [...prevAllies, allyType]);
    };

    const addItem = (itemName) => {
        setPlayerItems((prevItems) => [...prevItems, itemName]);
    };

    return { playerGold, playerAllies, playerItems, addGold, addAlly, addItem };
};

export default playerStatus;