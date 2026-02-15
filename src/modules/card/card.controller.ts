// const dummyCards = [
//     {
//         image:
//             'https://images.unsplash.com/photo-1562575214-da9fcf59b907?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         data: 'data',
//         isLiked: 'isLiked',
//         isSkipped: 'isSkipped',
//     },
//     {
//         image:
//             'https://images.unsplash.com/photo-1562575214-da9fcf59b907?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         data: 'data',
//         isLiked: 'isLiked',
//         isSkipped: 'isSkipped',
//     },
//     {
//         image:
//             'https://images.unsplash.com/photo-1562575214-da9fcf59b907?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         data: 'data',
//         isLiked: 'isLiked',
//         isSkipped: 'isSkipped',
//     },
// ];

// app.get('/', (req: Request, res: Response) => {
//     res.send('Hello World! Server is running with TypeScript.');
// });

// // Example API Route
// app.get('/api/status', (req: Request, res: Response) => {
//     res.json({ status: 'OK', timestamp: new Date() });
// });

// app.get('/api/dummy/cards', (req: Request, res: Response) => {
//     res.json(dummyCards);
// });

import { type Request, type Response } from "express";
import Card from "./card.model.ts";

export const getCards = async (req: Request, res: Response) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (error) {
        console.error("Error fetching cards:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createCard = async (req: Request, res: Response) => {
    try {
        // validate req.body
        const { image, data, isLiked, isSkipped } = req.body || {};

        if (!image || !data || !isLiked || !isSkipped) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const card = new Card({
            image,
            data,
            isLiked,
            isSkipped,
        });
        await card.save();
        res.json(card);
    } catch (error: any) {
        console.error("Error creating card:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};
