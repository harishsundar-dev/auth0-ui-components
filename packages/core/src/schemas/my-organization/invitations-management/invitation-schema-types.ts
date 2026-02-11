/**
 * Schema configuration options for invitation create form
 */
export interface InvitationCreateSchemas {
  /**
   * Email field validation configuration
   */
  emailList?: {
    /**
     * Regex pattern for email validation
     */
    regex?: RegExp;
    /**
     * Custom error message for validation failures
     */
    errorMessage?: string;
    /**
     * Maximum number of emails allowed
     */
    maxEmails?: number;
  };
  /**
   * Roles field validation configuration
   */
  roles?: {
    /**
     * Custom error message
     */
    errorMessage?: string;
  };
}
