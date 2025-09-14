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
    size: number
}

const ColorToHex = (color: Color): string => {
    const toHex = (channel: number): string => {
        return channel.toString(16).padStart(2, '0');
    }
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
} 

const Pixel = ({ color, size }: PixelProps): React.ReactElement => {
    return (
        <div
            style={{
                backgroundColor: color,
                width: size,
                height: size,
            }}
        />
    );
};

interface ProfilePictureProps {
    data: number;
    size: number;
}

export const ProfilePicture = ({ data, size = 6 }: ProfilePictureProps): React.ReactElement => {
    
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
        <div className="flex flex-col">
            {bitfield.map((row, i) => (
                <div key={i} className="flex flex-row">
                {row.map((cell, j) => (
                    <Pixel key={j} color={cell ? colorHexString : whiteHexString} size={size}/>
                ))}
                </div>
            ))}
        </div>
    );

};
