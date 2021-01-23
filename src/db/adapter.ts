import zlib from "zlib";
import fse from "fs-extra";
import msgpack from "msgpack";
import Base from "lowdb/adapters/Base";

import DatabaseMalformedError from "../errors/database-malformed";

const
    stringify = (object: Record<string, unknown>): string => zlib.brotliCompressSync(msgpack.pack(object)).toString("hex"),
    parse = (data: string): Record<string, unknown> => msgpack.unpack(zlib.brotliDecompressSync(data));

export default class CompressedFileSync extends Base 
{
    constructor(public source: string, { defaultValue = {}, serialize = stringify, deserialize = parse }) 
    {
        super(source, { defaultValue, serialize, deserialize });
    }

    public read() 
    {
        if (fse.existsSync(this.source)) 
        
            try 
            {
                const data = fse.readFileSync(this.source, "utf-8");

                return this.deserialize ? this.deserialize(data) : this.defaultValue;
            }
            catch 
            {
                throw new DatabaseMalformedError();
            }
        
        else 
        {
            fse.writeFileSync(this.source, this.serialize ? this.serialize(this.defaultValue) : zlib.brotliCompressSync(msgpack.pack(this.defaultValue)).toString("hex"), "utf-8");

            return this.defaultValue;
        }
    }

    public write(data: string) 
    {
        return fse.writeFileSync(this.source, this.serialize ? this.serialize(data) : this.defaultValue, "utf-8");
    }
}
