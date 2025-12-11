'use server';

/**
 * @fileOverview A tool that uses GenAI to check environment variables.
 *
 * - checkEnvironmentVariables - A function that checks the environment variables.
 * - CheckEnvironmentVariablesOutput - The return type for the checkEnvironmentVariables function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckEnvironmentVariablesOutputSchema = z.object({
  missingVariables: z.array(z.string()).describe('Array of missing environment variables.'),
  misconfiguredVariables: z.array(z.string()).describe('Array of misconfigured environment variables.'),
  summary: z.string().describe('Summary of the environment variable check.'),
});
export type CheckEnvironmentVariablesOutput = z.infer<typeof CheckEnvironmentVariablesOutputSchema>;

export async function checkEnvironmentVariables(): Promise<CheckEnvironmentVariablesOutput> {
  return checkEnvironmentVariablesFlow();
}

const checkEnvironmentVariablesFlow = ai.defineFlow(
  {
    name: 'checkEnvironmentVariablesFlow',
    outputSchema: CheckEnvironmentVariablesOutputSchema,
  },
  async () => {
    const requiredVariables = ['BASE_URL_ARGIS_CATASTRAL', 'API_KEY_CATASTRAL'];
    const missingVariables: string[] = [];
    const misconfiguredVariables: string[] = [];

    for (const variable of requiredVariables) {
      if (!process.env[variable]) {
        missingVariables.push(variable);
      }
    }

    let summary = '';

    if (missingVariables.length > 0) {
      summary += `Missing environment variables: ${missingVariables.join(', ')}. `;
    } else {
      summary += 'All required environment variables are present. ';
    }

    // Add more sophisticated checks for misconfiguration here if needed
    // (e.g., check if the API key is in the correct format, or if the URL is valid)

    return {
      missingVariables,
      misconfiguredVariables,
      summary,
    };
  }
);
