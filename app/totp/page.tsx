import TOTPPage from "@/components/TOTPPage";
import { notFound } from "next/navigation";

// 使用Next.js的metadata API设置页面标题
export const metadata = {
    title: 'TOTP 生成',
};

export default function Page() {
    // 检查是否配置了TOTP密钥，如果配置了则返回404
    if (process.env.TOTP_SECRET) {
        notFound();
    }
    return <TOTPPage />
}
