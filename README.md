# cw3d-ens-demo
This repo implements a little ENS resolver, using the [cw3d template](https://createweb3dapp.alchemy.com) maintained by Alchemy. The end result is a component like this:
![gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTdzN2NsNjJ5NXYza3FyM2tjbG5mMDk0cnB3ZDA0eGxxbjRydzd4ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yOZ67ne2mxdmhOMUtH/giphy.gif)

# How to add this component to your project
## Pre-requisites
If starting from scratch, I would highly recommend using the [cw3d template](https://createweb3dapp.alchemy.com). It will set up a NextJs project with all the necessary dependencies and scaffolding.

Generally, you will need to set up 3 things:
1. An Alchemy API key (you can get one [here](https://alchemy.com/?r=affiliate:elenamik:2021-08-03:web3d-ens-demo))
2. A backend endpoint to use the Alchemy SDK (I used NextJs API routes, but you can use whatever you want)
3. A React client to implement the frontend code (NextJS is a good choice)

## #1 Backend endpoint
Create a backend endpoint that your client can make POST requests to with an ENS address, and use the Alchemy SDK to resolve the ENS name and return the results to the client.
The below code is an example of how to do it with NextJs. 

You will have to install the Alchemy SDK with `npm i alchemy-sdk`, and add your Alchemy API key to your environment variables. The docs for the SDK are [here](https://docs.alchemy.com/docs/how-to-resolve-ewallet-given-ens).
```typescript
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
```

## 2. React Component
Create a component file in your client code, and paste the below code (you will get some import errors due to missing styles, don't worry, we address that in step 3!)
This component calls the API endpoint we created in step 1 (assuming NextJs, but you can adjust to your stack), and displays the results. It also has a copy button that copies the displayed text to the clipboard.

```typescript
import {useCallback, useEffect, useState} from "react";
import {Network} from 'alchemy-sdk'
import styles from "./EnsDisplay.module.css";


const EnsComponent: React.FC<{ens: string, chain: keyof typeof Network}> =({ens, chain}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState(null);

    const resolveEns = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/resolve-ens", {
                method: "POST",
                body: JSON.stringify({
                    ens: ens,
                    chain: chain ?? "ETH_MAINNET",
                }),
            })
            if (!res.ok) return console.error('Failed request', res)
            const {address} = await res.json()
            setAddress(address)

        } catch (e){
            console.log(e);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (ens && chain) resolveEns()
    }, [ens, chain])

    if (isLoading) return <div>Loading...</div>
    return (
        <div>
            <ToggleDisplay ens={ens} address={address!}/>
        </div>
    )
}

const ToggleDisplay: React.FC<{address:string, ens:string}> = ({address, ens}) => {
    const [showAddress, setShowAddress] = useState(false);

    // Creates display string for hashed address (e.g. 0x1234...5678)
    const concatAddress = (address: string) => {
        return address.substring(0, 6) + "..." + address.substring(address.length - 4, address.length)
    }
    const toggle = useCallback(() => {
        setShowAddress(!showAddress);
    }, [showAddress]);

    return <div className={styles.container}>
        {showAddress ?
            <div>
                <span onClick={toggle}>{concatAddress(address)}</span>
                <CopyButton textToCopy={address}/>
            </div>
            : <div>
                <span onClick={toggle}>{ens}</span>
                <CopyButton textToCopy={ens}/>
            </div>
        }
    </div>
}

const CopyButton:React.FC<{textToCopy:string}> =({textToCopy}) => {
    return <button className={styles.copyBtn} onClick={() => {
        navigator.clipboard.writeText(textToCopy)
        alert(`Copied ${textToCopy} to clipboard`)
    }}>
        <span className={styles.copyIcon}>&#x1F4C4;</span>
    </button>
}

export default EnsComponent;
```

## #3 Styles
You can implement styles however you need, but here is an example of how to do it with CSS modules (which you import in the component file, as shown in step 2).
```css
.container {
    display: flex;
    gap: 2px;
    overflow-wrap: break-word;
    cursor:pointer;
    padding-left: 4rem;
    padding-right: 4rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
}

.copyBtn {
    border: none;
    background: none;
    cursor: pointer;
}

.copyIcon {
    font-size: 16px;
}

```

## Final step: import the component and test it out!
Import the component and use it like below. You are done!
```typescript
<EnsComponent ens='555.eth' chain='ETH_MAINNET'/>
<EnsComponent ens='opensea.eth' chain='ETH_MAINNET'/>
```
You can find a bunch of ens names to test with [here](https://opensea.io/collection/ens).

