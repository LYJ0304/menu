import { z } from "zod";

import type { CsvSourceConfig } from "../types";
import { MND_MENU_SOURCE } from "../../types";

const envSchema = z.object({
  CSV_DOWNLOAD_URL: z.url(),
});

export function getMndMenuSourceConfig(): CsvSourceConfig {
  const env = envSchema.parse(process.env);
  const body = new URLSearchParams({
    txtTopSearch: "",
    txtTopGubun: "",
    txtContentSearch: "",
    pageNo: "1",
    tMenu: "Dataset",
    sMenu: "Dataset",
    leftFilter: "",
    leftSrvType: "",
    vinfId: "OA-9561",
    infNm: "제9030부대 식단 정보_월별",
    infSeq: "1",
    dtNm: "제9030부대 병영 표준 식단 정보",
    dsId: "TB_MNDT_DATEBYMLSVC_9030",
    strWhere: "",
    strOrderby: "",
    sortColNo: "",
    sortColNm: "",
    sortArrow: "",
    reurl: "",
    txtEngHeader:
      "dates,brst,brst_cal,lunc,lunc_cal,dinr,dinr_cal,adspcfd,adspcfd_cal,sum_cal",
    txtKorHeader:
      "날짜,조식,조식열량,중식,중식열량,석식,석식열량,증특식,증특식열량,열량합계",
    key: "",
    val: "",
    sel_col: "",
    filterCol: "필터선택",
    txtFilter: "",
  });

  return {
    source: MND_MENU_SOURCE,
    url: env.CSV_DOWNLOAD_URL,
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      accept: "text/csv,*/*;q=0.8",
      referer:
        "https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9561",
      "user-agent": "military-menu-recommend/1.0",
    },
    body,
  };
}
