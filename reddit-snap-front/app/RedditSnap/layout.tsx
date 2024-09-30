import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'RedditSnap'
}

export default function RedditSnapLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}  
        </>
    );
  }
