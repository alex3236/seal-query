import Link from "next/link";
import LogoSVG from "@/public/logo.svg";

export default function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    const LOGO_LINK = process.env.LOGO_LINK || "https://alex3236.moe/";
    return (
        <Link href={LOGO_LINK} target="_blank" area-label="Logo" >
            <LogoSVG className={className} {...props} />
        </Link>
    );
}
