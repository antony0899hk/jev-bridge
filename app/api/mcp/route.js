import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler((server) => {
  server.tool("jev_noul","Ask TypeSafe Jev a binary semantic question and return its probability.",{state:z.string(),instructions:z.string()},async ({state,instructions}) => {
    const key=process.env.TYPESAFE_API_KEY;
    if(!key) throw new Error("TYPESAFE_API_KEY is not configured");
    const response=await fetch("https://api.typesafe.ai/v1/systemone",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"jev-latest",state,questions:{answer:{type:"noul",instructions}}})});
    const data=await response.json();
    if(!response.ok) throw new Error(`TypeSafe API error ${response.status}: ${JSON.stringify(data)}`);
    return {content:[{type:"text",text:JSON.stringify(data)}]};
  });
});
export {handler as GET,handler as POST};
