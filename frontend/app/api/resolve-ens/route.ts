import {Alchemy, Network} from "alchemy-sdk"

export async function POST(req: Request, res: Response) {
    // extracting inputs from the request body
    const {chain, ens} = await req.json() as { chain: keyof typeof Network; ens: string };

    if (!chain || !ens) return new Response(
        JSON.stringify({error: "Invalid inputs. Expected: chain, ens"}),
        {status: 500}
    )
    try {
        // instantiate Alchemy Client
        const settings = {
            apiKey: process.env.ALCHEMY_API_KEY,
            network: Network.ETH_MAINNET,
        };
        const alchemy = new Alchemy(settings);

        // use Alchemy to resolve ens
        const address = await alchemy.core.resolveName(ens)
        console.log('result', address)

        // return resolved address
        return new Response(
            JSON.stringify(
            {
                address: address,
                ens: ens
            })
        )
    } catch (e) {
        // Catching any errors and responding with status 500 Internal Server Error and a message
        console.warn(e);
        return new Response(
            JSON.stringify(
                {error: "something went wrong, check the log in your terminal",}),
                {status: 500}
        )
    }
}