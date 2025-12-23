
export const runtime = "nodejs";

export async function register(){

    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const instrumentation = await import("./instrumentation.nodejs");
        instrumentation.registerNodeInstrumentation();
    }
    
}