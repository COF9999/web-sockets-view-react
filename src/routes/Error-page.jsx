import { useRouteError } from "react-router-dom";

export function ErrorPage(){
    const error = useRouteError()

    return(
        <div>
            <h1>Opps !!s</h1>
            <p>There is a unexpexted error</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    )
}