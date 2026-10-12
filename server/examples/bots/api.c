#include <stdio.h>
#include <string.h>

int main(void) {
    char input[131072];
    size_t length = fread(input, 1, sizeof(input) - 1, stdin);
    input[length] = '\0';

    const char *moves = strstr(input, "\"legalMoves\":[");
    if (!moves) {
        return 1;
    }
    moves += strlen("\"legalMoves\":[");

    const char *piece = strstr(moves, "\"pieceId\":\"");
    char piece_id[64];
    int row;
    int col;
    const char *to = strstr(moves, "\"to\":{\"row\":");
    if (!to || !piece ||
        sscanf(piece, "\"pieceId\":\"%63[^\"]\"", piece_id) != 1 ||
        sscanf(to, "\"to\":{\"row\":%d,\"col\":%d}", &row, &col) != 2) {
        if (*moves == ']') {
            puts("null");
            return 0;
        }
        return 1;
    }

    printf("{\"pieceId\":\"%s\",\"to\":{\"row\":%d,\"col\":%d}}\n",
           piece_id, row, col);
    return 0;
}
