package com.example.slovarius.nativeui

private val testDictionaryEntries = listOf(
    DictionaryEntry(id = "1", word = "салам", translation = "мир"),
    DictionaryEntry(id = "2", word = "китаб", translation = "книга"),
    DictionaryEntry(id = "3", word = "байт", translation = "дом"),
    DictionaryEntry(id = "4", word = "ма", translation = "вода"),
    DictionaryEntry(id = "5", word = "нур", translation = "свет"),
)

fun searchTestDictionaryEntries(query: String): List<DictionaryEntry> {
    val normalized = query.trim().lowercase()
    if (normalized.isBlank()) return testDictionaryEntries

    return testDictionaryEntries.filter { entry ->
        entry.word.lowercase().contains(normalized) ||
            entry.translation.lowercase().contains(normalized)
    }
}
