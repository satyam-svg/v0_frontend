import { MatchScreen } from "@/screen/referee/match"


const MatchPage = async ({ params }) => {
    const slug = (await params).id
    return (
        <div><MatchScreen matchId={slug} /></div>
    )
}

export default MatchPage