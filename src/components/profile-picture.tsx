/*
interface ProfilePicture {
    color: number;
    contentData: string;
}

const padTo5 = (s: string): string => s.padEnd(5, "0");

const generate = (data: ProfilePicture, element: HTMLElement): void => {
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

const loadProfilePicture = (data: number, element: HTMLElement | null): void => {
    //todo: verify number is uint32
    generate({
        color: user.profilePicture.substring(0, 6),
        contentData: user.profilePicture.substring(6),
    }, element);
};
*/

interface Color {
    r: number;
    g: number;
    b: number;
}

const DecodeColor = (encodedColor: number) : Color => {

    let red: number = 0
    let green: number = 0
    let blue: number = 0

    for(let i = 0; i < 5; i++){
        const bit: number = encodedColor & 0b1;
        red = (red << 1) | bit;
        encodedColor = encodedColor >> 1;
    }

    for(let i = 0; i < 6; i++){
        const bit: number = encodedColor & 0b1;
        green = (green << 1) | bit;
        encodedColor = encodedColor >> 1;
    }

    for(let i = 0; i < 5; i++){
        const bit: number = encodedColor & 0b1;
        blue = (blue << 1) | bit;
        encodedColor = encodedColor >> 1;
    }

    let color: Color = {
        r: Math.trunc((red / 0x1F) * 0xFF),
        g: Math.trunc((green / 0x3F) * 0xFF),
        b: Math.trunc((blue / 0x1F) * 0xFF), 
    }

    return color;

}

const DecodeBitfield = (encodedBitfield: number) : boolean[][] => {

    /*
		the identicon shape is constructed using these indexes from the bitfield string
		+-----+-----+-----+-----+-----+
		| 00  | 05  | 10  | 05  | 00  |
		+-----+-----+-----+-----+-----+
		| 01  | 06  | 11  | 06  | 01  |
		+-----+-----+-----+-----+-----+
		| 02  | 07  | 12  | 07  | 02  |
		+-----+-----+-----+-----+-----+
		| 03  | 08  | 13  | 08  | 03  |
		+-----+-----+-----+-----+-----+
		| 04  | 09  | 14  | 09  | 04  |
		+-----+-----+-----+-----+-----+
	*/

    const stringBuilder: string[] = [];
    
    for(let i = 0; i < 15; i++){
        const bit: number = encodedBitfield & 0b1;
        stringBuilder.push(bit.toString())
        encodedBitfield = encodedBitfield >> 1
    }

    const bits: string = stringBuilder.join('');

    const bitfield: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));

    for(let i = 0; i < 5; i++){
        let add: number = 0;
        for(let j = 0; j < 5; j++){
            if(j == 1 || j == 2){
                add += 5;
            }
            if(j == 3 || j == 4){
                add -= 5;
            }
            let index: number = i + add;
            bitfield[i][j] = bits[index] == '1';
        }
    }

    return bitfield

}

interface PixelProps {
    color: string
}

const ColorToHex = (color: Color): string => {
    const toHex = (channel: number): string => {
        return channel.toString(16).padStart(2, '0');
    }
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
} 

const Pixel = ({color} : PixelProps): React.ReactElement => {
    return (
        <div className="w-1.5 h-1.5" style={{ backgroundColor: color }} />
    );
}

interface ProfilePictureProps {
    data: number;
}

export const ProfilePicture = ({ data }: ProfilePictureProps): React.ReactElement => {
    
    const color: Color = DecodeColor(data & 0xFFFF)
    const bitfield: boolean[][] = DecodeBitfield((data >> 16) & 0x7FFF)

    const white: Color = {
        r: 255,
        g: 255,
        b: 255,
    };

    const colorHexString: string = ColorToHex(color);
    const whiteHexString: string = ColorToHex(white);

    return (
        <div className="flex flex-col border">
            {bitfield.map((row, i) => (
                <div key={i} className="flex flex-row">
                {row.map((cell, j) => (
                    <Pixel key={j} color={cell ? colorHexString : whiteHexString} />
                ))}
                </div>
            ))}
        </div>
    );

};
