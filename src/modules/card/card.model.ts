import { Schema, model } from "mongoose";

const cardSchema = new Schema({
    image: String,
    data: String,
    isLiked: String,
    isSkipped: String,
});

const Card = model("Card", cardSchema);

export default Card;