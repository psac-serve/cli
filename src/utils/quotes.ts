export default class Quotes 
{
    public static check(text: string): boolean 
    {
        return (text.replace(/\\"/, "").match(/"/g) || []).length % 2 != 0 ||
            (text.replace(/\\'/, "").match(/'/g) || []).length % 2 != 0 ||
            (text.replace(/\\`/, "").match(/`/g) || []).length % 2 != 0;
    }
}
