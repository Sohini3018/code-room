import OpenAI from 'openai'
import { encode } from 'gpt-3-encoder';
import dotenv from "dotenv"
import mongoose from 'mongoose';
import { Room } from '../models/room.models.js';
import { Chat, ChatContainer } from '../models/chat.models.js';

dotenv.config()


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let messageArr = [{ 'role': 'system', 'content': 'you are a code assistant who only answers coding questions and does not replies to prompt outside of coding topic' }]

let length = 0

function addMessage(data, type) {
    let encoded = encode(data);
    // console.log("length is:" + length);
    if (length + encoded.length >= 3900) {
        let val = messageArr[0]
        messageArr.splice(0, messageArr.length / 2)
        messageArr.unshift(val)
    }
    if (type == 'user') {
        messageArr.push({ 'role': type, 'content': data })
    } else if (type == "assistant") {
        messageArr.push({ "role": type, "content": data })
    }
    // console.log(messageArr)
}


export const chatBot = async (req, res) => {
    const { prompt } = req.body
    if (!prompt) {
        return res.status(400).json({
            "status": "failure",
            data: {
                statusCode: 400,
                message: "Please enter prompt to process"
            }
        })
    }
    addMessage(prompt, 'user')
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messageArr,
        });
        length = completion.usage.total_tokens;
        addMessage(completion.choices[0].message.content, "assistant")
        res.status(200).json({
            status: "success",
            data: {
                response: completion.choices[0].message.content
            }
        })
    } catch (error) {
        res.status(500).json({
            status: "failure",
            data: {
                response: "unable to process your request right now please try after some time"
            }
        })
        console.log(error)
    }
}

export const createChatContainer = async (req, res) => {
    const { roomId, name } = req.body
    try {
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "Enter correct room id"
                }
            });
        }
        const roomGot = Room.findById(roomId)
        if (!roomGot) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "no room exists with this roomId"
                }
            });
        }
        const containerCreated = await ChatContainer.create({ roomId, name })
        const containerGot = await ChatContainer.findById(containerCreated._id)
        if (!containerGot) {
            return res.status(500).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "Failed to create chat container"
                }
            });
        }
        return res.status(201).json({
            status: "success",
            data: {
                statusCode: 201,
                value: containerGot
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: "failure",
            data: {
                statusCode: 400,
                message: error.message || "Internal server error"
            }
        });
    }
}

export const getChatContainer = async (req, res) => {
    const roomId = req.query.roomId
    try {
        if (!roomId) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "please enter roomId"
                }
            })
        }
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "Enter correct room id"
                }
            });
        }
        const roomGot = await Room.findById(roomId)
        if (!roomGot) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "no room exists with this roomId"
                }
            });
        }
        const chatContainersGot = await ChatContainer.find({ roomId })
        return res.status(200).json({
            status: "success",
            data: {
                statusCode: 200,
                data: chatContainersGot
            }
        })

    } catch (error) {
        return res.status(500).json({
            status: "failure",
            data: {
                statusCode: 400,
                message: error.message || "Internal server error"
            }
        });
    }

}

export const createChat = async (req, res) => {
    const { chatContainerId, content, senderType } = req.body
    try {
        if (!mongoose.Types.ObjectId.isValid(chatContainerId)) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "Enter correct room id or containerId"
                }
            });
        }
        const containerGot = ChatContainer.findById(chatContainerId)
        if (!containerGot) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "no chat container exists with this containerId"
                }
            });
        }
        const chatCreate = await Chat.create({ chatContainerId, content, senderType })
        const chatGot = await Chat.findById(chatCreate._id)
        if (!chatGot) {
            return res.status(500).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "Failed to create chat"
                }
            });
        }
        return res.status(201).json({
            status: "success",
            data: {
                statusCode: 201,
                value: chatGot
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: "failure",
            data: {
                statusCode: 500,
                message: error.message || "Internal server error"
            }
        });
    }
}

export const getChats = async (req, res) => {
    const chatContainerId = req.query.chatContainerId
    try {
        if (!chatContainerId) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "please enter roomId"
                }
            })
        }
        if (!mongoose.Types.ObjectId.isValid(chatContainerId)) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "Enter correct room id"
                }
            });
        }
        const chatContainerGot = await ChatContainer.findById(chatContainerId)
        if (!chatContainerGot) {
            return res.status(400).json({
                status: "failure",
                data: {
                    statusCode: 400,
                    message: "no chatContainer exists with this id"
                }
            });
        }
        const chatsGot = await Chat.find({ chatContainerId })
        return res.status(200).json({
            status: "success",
            data: {
                statusCode: 200,
                data: chatsGot
            }
        })

    } catch (error) {
        return res.status(500).json({
            status: "failure",
            data: {
                statusCode: 500,
                message: error.message || "Internal server error"
            }
        });
    }

}


