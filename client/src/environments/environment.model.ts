export interface Environment {
  endOfService?: number;
  production: boolean;
  test: boolean;
  endpoints: {
    s3: string;
    lambdas: {
      eu: string;
      us: string;
    };
  };
}