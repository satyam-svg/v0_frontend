import Link from "next/link"
import stl from "./Series.module.scss"

const SeriesScreen = () => {
    return (
        <div>
            <h1>Series</h1>

            <button>
                <Link href={"/series/leaderboard"}>
                    Leaderboard
                </Link>

            </button>

        </div>
    )
}

export default SeriesScreen