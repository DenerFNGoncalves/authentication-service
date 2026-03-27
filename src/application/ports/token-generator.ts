export interface TokenGenerator {
    generate(bytes?: number): string;
}