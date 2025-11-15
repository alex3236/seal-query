import TOTPPage from "@/components/TOTPGenerator";
import { notFound } from "next/navigation";

export const metadata = {
    title: 'TOTP Generator',
};

export default function Page() {
    if (process.env.TOTP_SECRET) {
        notFound();
    }
    return <TOTPPage />
}
