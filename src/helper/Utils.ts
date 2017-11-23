export class Utils {

    /*
     *  Converts data to a target object iff it's null
     */
    static nullToObject(sourceType, targetType) {
        if (typeof sourceType === 'number' || typeof sourceType === 'boolean') {
            return sourceType;
        }
        else {
            return (sourceType == null) ? targetType : sourceType;
        }
    }
}