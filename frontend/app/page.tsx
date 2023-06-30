'use client'
import InstructionsComponent from "@/components/instructionsComponent";
import styles from "./page.module.css";
import "./globals.css";
import React from "react";
import EnsComponent from "@/components/EnsComponent";

export default function Home() {
  return (
    <main className={styles.main}>
      {/*<InstructionsComponent></InstructionsComponent>*/}
        <EnsComponent ens='555.eth' chain='ETH_MAINNET'/>
        <EnsComponent ens='opensea.eth' chain='ETH_MAINNET'/>
    </main>
  );
}
