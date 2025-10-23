import TOTPPage from "@/components/TOTPPage";
import { notFound } from "next/navigation";

export const metadata = {
    title: 'TOTP 生成',
};

export default function Page() {
    if (process.env.TOTP_SECRET) {
        notFound();
    }
    return <TOTPPage />
}
