namespace Google {
  export interface TextPart {
    text: string;
  }

  export interface FunctionCallPart {
    functionCall: {
      name: string;
      args?: Record<string, any>;
    };
  }

  export interface FunctionResponsePart {
    functionResponse: {
      name: string;
      response: any;
    };
  }

  export type Part = TextPart | FunctionCallPart | FunctionResponsePart;

  export interface Content {
    role: "user" | "model";
    parts: Part[];
  }

  export interface FunctionDeclaration {
    name: string;
    description?: string;
    parameters?: Record<string, any>;
  }

  export interface GenerateContentRequest {
    systemInstruction?: {
      parts: TextPart[];
    };
    tools?: {
      functionDeclarations: FunctionDeclaration[];
    }[];
    contents: Content[];
  }

  export interface GenerateContentResponse {
    candidates?: { content?: Content }[];
  }
}
export default Google;
