import React from "react";

type BoxProps = {} & React.ComponentPropsWithoutRef<"div">;

export default function Box(props: BoxProps) {
    return (
        <div
            {...props}
            className={`
                flex w-full h-full
                bg-sky-100
                border-1 border-sky-300 hover:border-sky-400 
                p-4 ${props.className || ""}`}
        >
            {props.children}
        </div>
    );
}
