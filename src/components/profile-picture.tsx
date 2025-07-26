import { useEffect, useRef } from "react";
import { User } from "../types/usertypes";

interface ProfilePicture {
    color: string;
    contentData: string;
}

const padTo5 = (s: string): string => s.padEnd(5, "0");

const generate = (data: ProfilePicture, element: HTMLElement) => {
    element.innerHTML = "";
    element.className = "flex flex-row w-fit";

    const full =
        padTo5(data.contentData.substring(0, 5)) +
        padTo5(data.contentData.substring(5, 10)) +
        padTo5(data.contentData.substring(10, 15));

    const pixels = [
        full.substring(0, 5),
        full.substring(5, 10),
        full.substring(10, 15),
    ];

    for (let i = 0; i < 5; i++) {
        let col = i;
        if (col === 3) col = 1;
        if (col === 4) col = 0;

        const columnDiv = document.createElement("div");
        columnDiv.className = "flex flex-col";

        for (let j = 0; j < 5; j++) {
            const pixel = document.createElement("div");
            pixel.className = "w-3 h-3";
            pixel.style.backgroundColor = pixels[col][j] === "1" ? `#${data.color}` : "#fff";
            columnDiv.appendChild(pixel);
        }

        element.appendChild(columnDiv);
    }
};

const loadProfilePicture = (user: User, element: HTMLElement | null) => {
    if (!element || !user?.profilePicture) return;
    console.log(user.profilePicture);
    console.log("hi");
    generate({
        color: user.profilePicture.substring(0, 6),
        contentData: user.profilePicture.substring(6),
    }, element);
};

interface ProfilePictureProps {
    user: User;
}

export const ProfilePicture = ({ user }: ProfilePictureProps) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        loadProfilePicture(user, ref.current);
    }, [user]);

    return <div ref={ref} />;
};

