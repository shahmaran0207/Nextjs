import Nav from "./Nav";

const layout = ({ children }) => {
    return (
        <>
            <Nav />
            <div>
                {children}
            </div>
        </>
    )
}

export default layout