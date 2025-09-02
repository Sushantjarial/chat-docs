import { NextRequest } from "next/server"

export  async function Post(req: NextRequest){
    const body = await req.json()
        
    console.log("Request body:", body)

    return new Response(JSON.stringify({ message: "Request received" }), {
      status: 200,
    })
}