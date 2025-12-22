export const useSearchNormalization = () => {
    const normalizeValue = (value?: string | null) =>
        value ? value.replace(/[^a-z0-9]/gi, '').toLowerCase() : ''

    const toLowerValue = (value?: string | null) =>
        (value ? value.toLowerCase() : '')

    const processSearchTerm = (search: string) => {
        const trimmedSearch = search.trim()
        return {
            trimmedSearch,
            rawSearchTerm: toLowerValue(trimmedSearch),
            normalizedSearchTerm: normalizeValue(trimmedSearch)
        }
    }

    return {
        normalizeValue,
        toLowerValue,
        processSearchTerm
    }
}