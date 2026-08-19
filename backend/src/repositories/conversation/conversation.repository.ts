import Conversation, { IConversation } from "../../models/Conversation";

export class ConversationRepository {
  async createConversation(data: Partial<IConversation>): Promise<IConversation> {
    return Conversation.create(data);
  }

  async findUserConversations(userId: string): Promise<IConversation[]> {
    return Conversation.find({ userId }).populate("agentId", "name model").sort({ updatedAt: -1 });
  }

  async findAgentConversations(agentId: string, userId: string): Promise<IConversation[]> {
    return Conversation.find({ agentId, userId }).sort({ updatedAt: -1 });
  }

  async findById(id: string): Promise<IConversation | null> {
    return Conversation.findById(id).populate("agentId");
  }

  async addMessage(
    id: string,
    role: "user" | "assistant" | "system",
    content: string
  ): Promise<IConversation | null> {
    return Conversation.findByIdAndUpdate(
      id,
      {
        $push: {
          messages: {
            role,
            content,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );
  }

  async deleteConversation(id: string): Promise<IConversation | null> {
    return Conversation.findByIdAndDelete(id);
  }
}

export const conversationRepository = new ConversationRepository();
