import Link from "next/link";
import styles from './header.module.scss'

export default function Header() {  
    return (
        <Link href="/">
            <a className={styles.header}>
                <img src="/images/logo.svg" alt="logo" ></img>
            </a>
        </Link>
    )
}
