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

    public static deparam(param: string) {
        if (!param || param.length === 0) {
            return {};
        }
        
        const split = param.split('/');
        if (split.length % 2 !== 0) {
            return {};
        }

        const result = {};
        for (let i = 0; i < split.length; i++) {
            result[split[i]] = split[++i];
        }

        return result;
    }
}