export class Utils {

    /*
     *  Converts data to a target object iff it's null
     */
    public static nullToObject(sourceType, targetType) {
        if (typeof sourceType === 'number' || typeof sourceType === 'boolean') {
            return sourceType;
        }
        else {
            return (sourceType == null) ? targetType : sourceType;
        }
    }

    /*
     * String to Base64
     */
    public static btoa(text: string) {
        return Buffer.from(text).toString('base64');
    }

    /*
     * Base64 to String
     */
    public static atob(text: string) {
        return Buffer.from(text, 'base64').toString('ascii');
    }
}