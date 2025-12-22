import { Header } from "@/components/header";

export const metadata = {
    title: "Khelclub | Organizer",
    description: "Khelclub",
};

export default function OrganizerLayout({ children }) {
    return (
        <>
            <Header />
            {children}
        </>
    )
}