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