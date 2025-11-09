import { JSError } from '@noeldemartin/utils';

export class NotFound extends JSError {
    constructor() {
        super('404: Not Found');
    }
}
