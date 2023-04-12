export interface SendEmailData {
    /**
     * The email address of the sender
     */
    sender: string;
    
    /**
     * The email address of the recipient(s)
     */
    to: string[];

    textContent?: string;

    htmlContent?: string;

    subject: string;

    // TODO: Attachments?
}

export abstract class EmailerService {
    abstract sendEmail(email: SendEmailData): Promise<void>;
}
