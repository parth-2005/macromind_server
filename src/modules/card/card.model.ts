import { Schema, model } from "mongoose";

const cardSchema = new Schema({
    image: String,
    data: String,

    // UI CONFIGURATION LABELS
    // Note: These do not track user state. They define the Overlay Text.
    isLiked: String,   // Text shown on RIGHT swipe (e.g. "Like", "Invest")
    isSkipped: String, // Text shown on LEFT swipe (e.g. "Pass", "Ignore")

    // Optional: Add the actual filters for your engine
    // category: String, 
    // tags: [String]
});

const Card = model("Card", cardSchema);

export default Card;