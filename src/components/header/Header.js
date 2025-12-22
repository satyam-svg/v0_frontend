'use client'
import stl from "./Header.module.scss"
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import { useRouter } from "next/navigation";
import Logo from "@public/logo.png"
import Image from "next/image";

const Header = ({ details, referee }) => {
    const nameParts = details?.name?.split("~");
    const router = useRouter()
    const handleClick = () => {
            router.push("/")
    }
    return (
        <header className={stl.container}>
            <div className={stl.logo} onClick={handleClick}>
                <p>KHELCLUB</p>
            </div>
            {details ? <>
                <div className={stl.name}>
                    <h2>{nameParts ? nameParts[0] : ''}</h2>
                    {nameParts && nameParts[1] &&<h3><FmdGoodOutlinedIcon style={{ fontSize: "1rem", color: 'white' }} /> {nameParts ? nameParts[1] : ''}</h3>}
                </div>
                <div className={stl.format}>
                    <p>Type : {details ? details?.type : ''}</p>
                    {nameParts && nameParts[2] &&<p>Format : {nameParts ? nameParts[2] : ''} </p>}
                </div>
            </>
                : ""}
        </header>
    )
}

export default Header;