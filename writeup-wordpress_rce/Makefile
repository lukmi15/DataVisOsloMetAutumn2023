PDF_NAME=writeup-authenticated_wordpress_rce
LATEX_TEMPFILE_DIR=tmp
SRC_FILE=writeup.tex
PRECOMPILE_CMD=pdflatex -draftmode -jobname ${PDF_NAME} -output-directory ${LATEX_TEMPFILE_DIR} ${SRC_FILE}
COMPILE_CMD=pdflatex -file-line-error -halt-on-error -jobname ${PDF_NAME} -output-directory ${LATEX_TEMPFILE_DIR} ${SRC_FILE}

${PDF_NAME}.pdf: ${SRC_FILE} Makefile ${LATEX_TEMPFILE_DIR}
	${PRECOMPILE_CMD}
	${COMPILE_CMD}
	mv -v "${LATEX_TEMPFILE_DIR}/${PDF_NAME}.pdf" ./

${LATEX_TEMPFILE_DIR}:
	mkdir "${LATEX_TEMPFILE_DIR}"

clean:
	rm -r ${LATEX_TEMPFILE_DIR}

.PHONY: clean
