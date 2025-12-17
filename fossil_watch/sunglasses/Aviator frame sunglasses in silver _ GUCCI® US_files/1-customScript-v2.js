!function ($) {
    var config = _insideCustomConfig;
    var websiteId, device, isMobileDevice, chatSettings;
    var chatDocument, initialChatPaneHeight, postChatSurveyVideo;
    var customTabHolder;
    var operatorId, operatorName, insideChatCategory, lastAssistantName;
    var useNewDesign = true; // user story #32375
    var departmentSelected = false;

    var svgTabMobile = '<svg id="e7iZku6LgcM1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 40 40" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" width="40" height="40"><style><![CDATA[#e7iZku6LgcM3_to {animation: e7iZku6LgcM3_to__to 7500ms linear 3 normal forwards}@keyframes e7iZku6LgcM3_to__to { 0% {transform: translate(20.000001px,19px)} 33.333333% {transform: translate(20.000001px,19px)} 43.333333% {transform: translate(-6.16373px,19px)} 90% {transform: translate(-13.16373px,19px)} 100% {transform: translate(-13.16373px,19px)}} #e7iZku6LgcM3 {animation: e7iZku6LgcM3_c_o 7500ms linear 3 normal forwards}@keyframes e7iZku6LgcM3_c_o { 0% {opacity: 1} 33.333333% {opacity: 1} 43.333333% {opacity: 0} 90% {opacity: 0} 100% {opacity: 0}} #e7iZku6LgcM4_to {animation: e7iZku6LgcM4_to__to 7500ms linear 3 normal forwards}@keyframes e7iZku6LgcM4_to__to { 0% {transform: translate(46.476636px,19px)} 43.333333% {transform: translate(46.025975px,19px)} 90% {transform: translate(46.000001px,19px)} 100% {transform: translate(20.000001px,19px)}} #e7iZku6LgcM4 {animation: e7iZku6LgcM4_c_o 7500ms linear 3 normal forwards}@keyframes e7iZku6LgcM4_c_o { 0% {opacity: 0} 90% {opacity: 0} 100% {opacity: 1}} #e7iZku6LgcM5_to {animation: e7iZku6LgcM5_to__to 7500ms linear 3 normal forwards}@keyframes e7iZku6LgcM5_to__to { 0% {transform: translate(45.976636px,19.298506px)} 33.333333% {transform: translate(45.956905px,19.298506px)} 43.333333% {transform: translate(21.494282px,19.298506px)} 90% {transform: translate(21.494282px,19.298506px)} 100% {transform: translate(-4.505717px,19.298506px)}} #e7iZku6LgcM5 {animation: e7iZku6LgcM5_c_o 7500ms linear 3 normal forwards}@keyframes e7iZku6LgcM5_c_o { 0% {opacity: 0} 33.333333% {opacity: 0} 43.333333% {opacity: 1} 90% {opacity: 1} 100% {opacity: 0}}]]></style><path d="M45.346977,62.05963c-3.695679,1.30125-7.691007,2.10202-11.886102,2.10202C14.982481,64.16165,0,49.7478,0,32.030777C0,14.313753,14.982481,0,33.460875,0s33.460875,14.313753,33.460875,32.030777c0,7.807502-2.896613,14.91433-7.691007,20.519716-.199766,3.803655-.199766,10.20981,1.997664,13.713176c1.598131,2.802693-12.285635-2.702596-15.88143-4.204039Z" transform="matrix(-.597713 0 0 0.597012 40.000022 0.000258)" clip-rule="evenodd" fill="#1b1b1b" fill-rule="evenodd"/><g id="e7iZku6LgcM3_to" transform="translate(20.000001,19)"><path id="e7iZku6LgcM3" d="M36.4,22.2002h-.2c-1,0-1.9.2-2.7.4.6.3,1.1.7,1.5,1.1.6-.2,1.3-.3,2-.3.0132,0,.0404-.0018.0804-.0043.2627-.0169,1.0782-.0693,2.1196.1043c1.2.2,2.6.7,3.8,1.7-1.2-1.8-3.7-3-6.6-3Zm1.5999,10.0996c0,0,0-.4-.1-1c0-.2-.1-.3-.1-.3h-.1-5.5-.2v1.1c.1,0,.2,0,.4.1.0899,0,.1798.0202.2787.0425.1213.0272.2561.0575.4213.0575.1171,0,.2.0343.2686.0627.0485.0201.0899.0373.1314.0373.1675.0419.3175.0662.4499.0877h.0001c.1837.0298.3337.0542.45.1123.3.1.5.2.7.5.2.2.3.4.3.7v.8h-.0001c-.1.5-.2,1-.2999,1.3-.9,3-2.9,4.7-5.5,4.7-3.7,0-6.4-3.7-6.4-8.4c0-4.6,3-8.4,6.7-8.4.0029,0,.0085-.0002.0167-.0007l.0153-.0008c.3603-.0199,3.4749-.1915,5.768,2.1015-1.2-2.2-3.7-3.6-6.4-3.6h-.2c-5,.1-9,4.5-9,10.1s4.1,10.1,9,10.1c4.8-.1,8.9-4.6,8.9-10.2Zm-7.4,7.5004c-1.6-1.9-2.7-4.5-2.7-7.3c0-3.1,1.3-5.8,3.1-7.8.7.1,1.7.3,2.7.8-1.6,1.6-2.7,4.1-2.7,6.8c0,2.4.7,4.6,1.9,6.1-.6.7-1.4,1.2-2.3,1.4Zm15.2002-8.2004c.1.6.1,1,.1,1c0,5.4-4.2,9.8-9.3,9.9-1.1,0-2.1-.2-3-.5.7-.4,1.3-.9,1.9-1.5.4.1.9.2,1.4.2c2.7,0,4.8-1.7,5.7-4.6.1-.2.2-.7.3-1.2v-.8c0-.3-.1-.5-.3-.7-.3279-.4099-.6558-.4838-1.2042-.6073-.1205-.0271-.2516-.0567-.3958-.0927-.1,0-.175-.025-.25-.05s-.15-.05-.25-.05c-.1652,0-.3-.0303-.4212-.0575-.099-.0223-.1889-.0425-.2788-.0425-.1-.1-.2-.1-.3-.1h-.1v-1.1h.3h5.8.1c.1,0,.2.1.2.3Z" transform="scale(0.597713,0.597012) translate(-33,-32.35)" clip-rule="evenodd" fill="#fff" fill-rule="evenodd"/></g><g id="e7iZku6LgcM4_to" transform="translate(46.476636,19)"><path id="e7iZku6LgcM4" d="M36.4,22.2002h-.2c-1,0-1.9.2-2.7.4.6.3,1.1.7,1.5,1.1.6-.2,1.3-.3,2-.3.0132,0,.0404-.0018.0804-.0043.2627-.0169,1.0782-.0693,2.1196.1043c1.2.2,2.6.7,3.8,1.7-1.2-1.8-3.7-3-6.6-3Zm1.5999,10.0996c0,0,0-.4-.1-1c0-.2-.1-.3-.1-.3h-.1-5.5-.2v1.1c.1,0,.2,0,.4.1.0899,0,.1798.0202.2787.0425.1213.0272.2561.0575.4213.0575.1171,0,.2.0343.2686.0627.0485.0201.0899.0373.1314.0373.1675.0419.3175.0662.4499.0877h.0001c.1837.0298.3337.0542.45.1123.3.1.5.2.7.5.2.2.3.4.3.7v.8h-.0001c-.1.5-.2,1-.2999,1.3-.9,3-2.9,4.7-5.5,4.7-3.7,0-6.4-3.7-6.4-8.4c0-4.6,3-8.4,6.7-8.4.0029,0,.0085-.0002.0167-.0007l.0153-.0008c.3603-.0199,3.4749-.1915,5.768,2.1015-1.2-2.2-3.7-3.6-6.4-3.6h-.2c-5,.1-9,4.5-9,10.1s4.1,10.1,9,10.1c4.8-.1,8.9-4.6,8.9-10.2Zm-7.4,7.5004c-1.6-1.9-2.7-4.5-2.7-7.3c0-3.1,1.3-5.8,3.1-7.8.7.1,1.7.3,2.7.8-1.6,1.6-2.7,4.1-2.7,6.8c0,2.4.7,4.6,1.9,6.1-.6.7-1.4,1.2-2.3,1.4Zm15.2002-8.2004c.1.6.1,1,.1,1c0,5.4-4.2,9.8-9.3,9.9-1.1,0-2.1-.2-3-.5.7-.4,1.3-.9,1.9-1.5.4.1.9.2,1.4.2c2.7,0,4.8-1.7,5.7-4.6.1-.2.2-.7.3-1.2v-.8c0-.3-.1-.5-.3-.7-.3279-.4099-.6558-.4838-1.2042-.6073-.1205-.0271-.2516-.0567-.3958-.0927-.1,0-.175-.025-.25-.05s-.15-.05-.25-.05c-.1652,0-.3-.0303-.4212-.0575-.099-.0223-.1889-.0425-.2788-.0425-.1-.1-.2-.1-.3-.1h-.1v-1.1h.3h5.8.1c.1,0,.2.1.2.3Z" transform="scale(0.597713,0.597012) translate(-33,-32.35)" opacity="0" clip-rule="evenodd" fill="#fff" fill-rule="evenodd"/></g><g id="e7iZku6LgcM5_to" transform="translate(45.976636,19.298506)"><path id="e7iZku6LgcM5" d="M22,33c0,1.656857-1.343143,3-3,3s-3-1.343143-3-3s1.343143-3,3-3s3,1.343143,3,3Zm12,0c0,1.656857-1.343143,3-3,3s-3-1.343143-3-3s1.343143-3,3-3s3,1.343143,3,3Zm9,3c1.656857,0,3-1.343143,3-3s-1.343143-3-3-3-3,1.343143-3,3s1.343143,3,3,3Z" transform="scale(0.597713,0.597012) translate(-33.5,-33.5)" opacity="0" clip-rule="evenodd" fill="#fff" fill-rule="evenodd"/></g></svg>';

    var svgTab = '<svg id="eDya45WL8BN1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 67 67" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" width="67" height="67"><style><![CDATA[#eDya45WL8BN3_to {animation: eDya45WL8BN3_to__to 7500ms linear 3 normal forwards}@keyframes eDya45WL8BN3_to__to { 0% {transform: translate(33px,32.35px)} 33.333333% {transform: translate(33px,32.35px)} 43.333333% {transform: translate(-13.16373px,32.35px)} 90% {transform: translate(-13.16373px,32.35px)} 100% {transform: translate(-13.16373px,32.35px)}} #eDya45WL8BN3 {animation: eDya45WL8BN3_c_o 7500ms linear 3 normal forwards}@keyframes eDya45WL8BN3_c_o { 0% {opacity: 1} 33.333333% {opacity: 1} 43.333333% {opacity: 0} 90% {opacity: 0} 100% {opacity: 0}} #eDya45WL8BN4_to {animation: eDya45WL8BN4_to__to 7500ms linear 3 normal forwards}@keyframes eDya45WL8BN4_to__to { 0% {transform: translate(83px,32.35px)} 43.333333% {transform: translate(83.025975px,32.35px)} 90% {transform: translate(82.900101px,32.35px)} 100% {transform: translate(32.83627px,32.35px)}} #eDya45WL8BN4 {animation: eDya45WL8BN4_c_o 7500ms linear 3 normal forwards}@keyframes eDya45WL8BN4_c_o { 0% {opacity: 0} 90% {opacity: 0} 100% {opacity: 1}} #eDya45WL8BN5_to {animation: eDya45WL8BN5_to__to 7500ms linear 3 normal forwards}@keyframes eDya45WL8BN5_to__to { 0% {transform: translate(79.5px,33px)} 33.333333% {transform: translate(78.956905px,33px)} 43.333333% {transform: translate(36px,33px)} 90% {transform: translate(36px,33px)} 100% {transform: translate(-8.206825px,33px)}} #eDya45WL8BN5 {animation: eDya45WL8BN5_c_o 7500ms linear 3 normal forwards}@keyframes eDya45WL8BN5_c_o { 0% {opacity: 0} 33.333333% {opacity: 0} 43.333333% {opacity: 1} 90% {opacity: 1} 100% {opacity: 0}}]]></style><path d="M45.4,62.05963c-3.7,1.30125-7.7,2.10202-11.9,2.10202C15,64.16165,0,49.7478,0,32.030777C0,14.313753,15,0,33.5,0s33.5,14.313753,33.5,32.030777c0,7.807502-2.9,14.91433-7.7,20.519716-.2,3.803655-.2,10.20981,2,13.713176c1.6,2.802693-12.3-2.702596-15.9-4.204039Z" clip-rule="evenodd" fill="#1b1b1b" fill-rule="evenodd"/><g id="eDya45WL8BN3_to" transform="translate(33,32.35)"><path id="eDya45WL8BN3" d="M36.4,22.2002h-.2c-1,0-1.9.2-2.7.4.6.3,1.1.7,1.5,1.1.6-.2,1.3-.3,2-.3.0132,0,.0404-.0018.0804-.0043.2627-.0169,1.0782-.0693,2.1196.1043c1.2.2,2.6.7,3.8,1.7-1.2-1.8-3.7-3-6.6-3Zm1.5999,10.0996c0,0,0-.4-.1-1c0-.2-.1-.3-.1-.3h-.1-5.5-.2v1.1c.1,0,.2,0,.4.1.0899,0,.1798.0202.2787.0425.1213.0272.2561.0575.4213.0575.1171,0,.2.0343.2686.0627.0485.0201.0899.0373.1314.0373.1675.0419.3175.0662.4499.0877h.0001c.1837.0298.3337.0542.45.1123.3.1.5.2.7.5.2.2.3.4.3.7v.8h-.0001c-.1.5-.2,1-.2999,1.3-.9,3-2.9,4.7-5.5,4.7-3.7,0-6.4-3.7-6.4-8.4c0-4.6,3-8.4,6.7-8.4.0029,0,.0085-.0002.0167-.0007l.0153-.0008c.3603-.0199,3.4749-.1915,5.768,2.1015-1.2-2.2-3.7-3.6-6.4-3.6h-.2c-5,.1-9,4.5-9,10.1s4.1,10.1,9,10.1c4.8-.1,8.9-4.6,8.9-10.2Zm-7.4,7.5004c-1.6-1.9-2.7-4.5-2.7-7.3c0-3.1,1.3-5.8,3.1-7.8.7.1,1.7.3,2.7.8-1.6,1.6-2.7,4.1-2.7,6.8c0,2.4.7,4.6,1.9,6.1-.6.7-1.4,1.2-2.3,1.4Zm15.2002-8.2004c.1.6.1,1,.1,1c0,5.4-4.2,9.8-9.3,9.9-1.1,0-2.1-.2-3-.5.7-.4,1.3-.9,1.9-1.5.4.1.9.2,1.4.2c2.7,0,4.8-1.7,5.7-4.6.1-.2.2-.7.3-1.2v-.8c0-.3-.1-.5-.3-.7-.3279-.4099-.6558-.4838-1.2042-.6073-.1205-.0271-.2516-.0567-.3958-.0927-.1,0-.175-.025-.25-.05s-.15-.05-.25-.05c-.1652,0-.3-.0303-.4212-.0575-.099-.0223-.1889-.0425-.2788-.0425-.1-.1-.2-.1-.3-.1h-.1v-1.1h.3h5.8.1c.1,0,.2.1.2.3Z" transform="translate(-33,-32.35)" clip-rule="evenodd" fill="#fff" fill-rule="evenodd"/></g><g id="eDya45WL8BN4_to" transform="translate(83,32.35)"><path id="eDya45WL8BN4" d="M36.4,22.2002h-.2c-1,0-1.9.2-2.7.4.6.3,1.1.7,1.5,1.1.6-.2,1.3-.3,2-.3.0132,0,.0404-.0018.0804-.0043.2627-.0169,1.0782-.0693,2.1196.1043c1.2.2,2.6.7,3.8,1.7-1.2-1.8-3.7-3-6.6-3Zm1.5999,10.0996c0,0,0-.4-.1-1c0-.2-.1-.3-.1-.3h-.1-5.5-.2v1.1c.1,0,.2,0,.4.1.0899,0,.1798.0202.2787.0425.1213.0272.2561.0575.4213.0575.1171,0,.2.0343.2686.0627.0485.0201.0899.0373.1314.0373.1675.0419.3175.0662.4499.0877h.0001c.1837.0298.3337.0542.45.1123.3.1.5.2.7.5.2.2.3.4.3.7v.8h-.0001c-.1.5-.2,1-.2999,1.3-.9,3-2.9,4.7-5.5,4.7-3.7,0-6.4-3.7-6.4-8.4c0-4.6,3-8.4,6.7-8.4.0029,0,.0085-.0002.0167-.0007l.0153-.0008c.3603-.0199,3.4749-.1915,5.768,2.1015-1.2-2.2-3.7-3.6-6.4-3.6h-.2c-5,.1-9,4.5-9,10.1s4.1,10.1,9,10.1c4.8-.1,8.9-4.6,8.9-10.2Zm-7.4,7.5004c-1.6-1.9-2.7-4.5-2.7-7.3c0-3.1,1.3-5.8,3.1-7.8.7.1,1.7.3,2.7.8-1.6,1.6-2.7,4.1-2.7,6.8c0,2.4.7,4.6,1.9,6.1-.6.7-1.4,1.2-2.3,1.4Zm15.2002-8.2004c.1.6.1,1,.1,1c0,5.4-4.2,9.8-9.3,9.9-1.1,0-2.1-.2-3-.5.7-.4,1.3-.9,1.9-1.5.4.1.9.2,1.4.2c2.7,0,4.8-1.7,5.7-4.6.1-.2.2-.7.3-1.2v-.8c0-.3-.1-.5-.3-.7-.3279-.4099-.6558-.4838-1.2042-.6073-.1205-.0271-.2516-.0567-.3958-.0927-.1,0-.175-.025-.25-.05s-.15-.05-.25-.05c-.1652,0-.3-.0303-.4212-.0575-.099-.0223-.1889-.0425-.2788-.0425-.1-.1-.2-.1-.3-.1h-.1v-1.1h.3h5.8.1c.1,0,.2.1.2.3Z" transform="translate(-33,-32.35)" opacity="0" clip-rule="evenodd" fill="#fff" fill-rule="evenodd"/></g><g id="eDya45WL8BN5_to" transform="translate(79.5,33)"><path id="eDya45WL8BN5" d="M22,33c0,1.656857-1.343143,3-3,3s-3-1.343143-3-3s1.343143-3,3-3s3,1.343143,3,3Zm12,0c0,1.656857-1.343143,3-3,3s-3-1.343143-3-3s1.343143-3,3-3s3,1.343143,3,3Zm9,3c1.656857,0,3-1.343143,3-3s-1.343143-3-3-3-3,1.343143-3,3s1.343143,3,3,3Z" transform="translate(-33.5,-33.5)" opacity="0" clip-rule="evenodd" fill="#fff" fill-rule="evenodd"/></g></svg>';

    var svgTabClose = '<svg class="close" width="67" height="67" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M45.4 62.0162C41.7 63.3165 37.7 64.1167 33.5 64.1167C15 64.1167 0 49.713 0 32.0084C0 14.3037 15 0 33.5 0C52 0 67 14.3037 67 32.0084C67 39.8104 64.1 46.9123 59.3 52.5137C59.1 56.3147 59.1 62.7164 61.3 66.2173C62.9 69.018 49 63.5166 45.4 62.0162Z" fill="#1B1B1B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M33.5 33.5001L24 43.0001L23.2929 42.293L32.7929 32.793L24 24.0001L24.7071 23.293L33.5 32.0859L42.2929 23.293L43 24.0001L34.2071 32.793L43.7071 42.293L43 43.0001L33.5 33.5001Z" fill="white"/></svg>';

    var svgChatTab = '<svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.62442 21.5938L5 27.5L11.0711 25.9149C12.7437 26.8234 14.632 27.3016 16.5481 27.3026C22.86 27.3026 27.9971 22.1899 28 15.9061C28.001 12.8605 26.8108 9.997 24.6491 7.84267C22.4864 5.68833 19.6112 4.50096 16.5481 4.5C10.2363 4.5 5.09918 9.61271 5.09629 15.8955C5.09533 17.9052 5.62204 19.865 6.62442 21.5938ZM16.5443 25.3773C14.5068 25.3763 12.9661 24.8052 11.3523 23.8516L7.7491 24.7917L8.71104 21.2957C7.65666 19.6254 7.02885 18.0288 7.02981 15.8965C7.03173 10.6736 11.3022 6.42433 16.552 6.42433C21.8152 6.42625 26.0684 10.6697 26.0665 15.9042C26.0636 21.128 21.7902 25.3773 16.5443 25.3773ZM12.6668 16.9579C13.1961 16.9579 13.6252 16.5289 13.6252 15.9996C13.6252 15.4703 13.1961 15.0413 12.6668 15.0413C12.1376 15.0413 11.7085 15.4703 11.7085 15.9996C11.7085 16.5289 12.1376 16.9579 12.6668 16.9579ZM16.5003 16.9579C17.0296 16.9579 17.4587 16.5289 17.4587 15.9996C17.4587 15.4703 17.0296 15.0413 16.5003 15.0413C15.9711 15.0413 15.542 15.4703 15.542 15.9996C15.542 16.5289 15.9711 16.9579 16.5003 16.9579ZM21.2917 15.9996C21.2917 16.5289 20.8626 16.9579 20.3333 16.9579C19.8041 16.9579 19.375 16.5289 19.375 15.9996C19.375 15.4703 19.8041 15.0413 20.3333 15.0413C20.8626 15.0413 21.2917 15.4703 21.2917 15.9996Z" fill="#1B1B1B"/></svg>';

    var svgVideoTab = '<svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_13_347)"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.2001 9.59995C4.2001 8.49995 5.1001 7.69995 6.2001 7.69995H21.0001C22.1001 7.69995 23.0001 8.59995 23.0001 9.59995V13.3L26.0001 11.6C27.3001 10.9 28.9001 11.8 28.9001 13.3V20.7C28.9001 22.2 27.3001 23.1 26.0001 22.4L23.0001 20.7V23.7C23.0001 24.8 22.1001 25.6 21.0001 25.6H6.1001C5.0001 25.6 4.1001 24.7 4.1001 23.7V9.59995H4.2001ZM23.0001 18.7C23.4001 18.9 26.8001 20.9 26.8001 20.9C27.0001 21 27.2001 20.9 27.2001 20.7V13.2C27.2001 13 27.0001 12.9 26.8001 13C26.8001 13 23.4001 15 23.1001 15.1C23.1001 15.1 22.8001 15.2 22.4001 15.2C22.0001 15.2 21.5001 15.2 21.4001 15.2C21.2001 15.2 21.2001 15.1 21.2001 14.8C21.2001 14.6 21.2001 14.2 21.2001 14.2V9.59995C21.2001 9.49995 21.1001 9.29995 20.9001 9.29995H6.1001C6.0001 9.29995 5.9001 9.49995 5.9001 9.59995V23.5C5.9001 23.6 6.0001 23.7999 6.2001 23.7999H21.0001C21.1001 23.7999 21.3001 23.7 21.3001 23.5V19.5C21.3001 19.5 21.3001 19.2 21.3001 18.9C21.3001 18.6 21.4001 18.5 21.7001 18.5C22.0001 18.5 22.7001 18.5 22.7001 18.5C22.7001 18.5 22.9001 18.6 23.0001 18.7Z" fill="#1B1B1B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.2002 14.5999C11.2002 13.4999 12.4002 12.8999 13.3002 13.3999L16.8002 15.3999C17.7002 15.8999 17.7002 17.2999 16.8002 17.7999L13.3002 19.7999C12.4002 20.2999 11.2002 19.6999 11.2002 18.5999V14.5999V14.5999ZM13.1002 15.3999V17.6999L15.1002 16.4999L13.1002 15.3999Z" fill="#1B1B1B"/></g><defs><clipPath id="clip0_13_347"><rect width="25" height="18" fill="white" transform="translate(4 7.5)"/></clipPath></defs></svg>';

    const DraggableTab  = new function () {
        this.init = function() {
            const tabElement = $("#inside_custom_tabs");
            let tabMouseDown = false, mouseX = 0, mouseY = 0;
            tabElement.on('mousedown touchstart', mouseDown);
            function mouseDown(e) {
                tabMouseDown = true;
                mouseX = e.clientX - parseInt(tabElement.css("margin-left"));
                mouseY = e.clientY - parseInt(tabElement.css("margin-top"));

                if (typeof (e.originalEvent.touches) != "undefined") {
                    mouseY = e.originalEvent.touches[0].clientY - parseInt(tabElement.css("margin-top"));
                    mouseX = e.originalEvent.touches[0].clientX - parseInt(tabElement.css("margin-left"));
                }

                $(window).bind("mousemove", mouseMove);
                window.addEventListener("touchmove", mouseMove, { passive: false });

                function mouseMove(e) {
                    e.preventDefault();
                    let clientY = e.clientY;
                    let clientX = e.clientX;
                    if (typeof (e.touches) != "undefined") {
                        clientY = e.touches[0].clientY;
                        clientX = e.touches[0].clientX;
                    }

                    let moveX = clientX - mouseX, moveY = clientY - mouseY;
                    let newPos = checkTabMargin({
                        x: moveX,
                        y: moveY
                    });
                    moveX = newPos.x;
                    moveY = newPos.y;

                    let cssObject = {
                        '--data-move-x': 0,
                        '--data-move-y': 0,
                    }
                    if (Math.abs(moveY) > Math.abs(moveX)) { // vertical
                        cssObject["--data-move-y"] = moveY + "px";
                    } else { // horizontal
                        cssObject["--data-move-x"] = moveX + "px";
                    }
                    tabElement.css(cssObject);
                    InverseTab.checkTabPosition();
                }

                tabElement.off("mouseup touchend");

                window.addEventListener("mouseup", mouseUp);
                window.addEventListener("touchend", mouseUp);

                if(isMobileDevice) {
                    $('body').css('overflow', 'hidden');
                }
                function mouseUp(e) {
                    window.removeEventListener("touchmove", mouseMove, { passive: false });
                    window.removeEventListener("mouseup", mouseUp);
                    window.removeEventListener("touchend", mouseUp);
                    if(isMobileDevice) {
                        $('body').css('overflow', 'auto');
                    }
                }
            }

            top.addEventListener("resize", adjustPosition);
        }

        this.adjustPosition = adjustPosition;
        function adjustPosition() {
            const tabElement = $("#inside_custom_tabs");
            if(tabElement.length === 0) return;
            let newPos = checkTabMargin({
                x: parseInt(tabElement.css("--data-move-x")),
                y: parseInt(tabElement.css("--data-move-y"))
            })
            if (newPos.y) {
                tabElement.css({
                    '--data-move-y': newPos.y + 'px',
                });
            } else if (newPos.x) {
                tabElement.css({
                    '--data-move-x': newPos.x + 'px',
                });
            }
        }

        function checkTabMargin(pos) {
            const tabElement = $("#inside_custom_tabs");
            const rect = tabElement[0].getBoundingClientRect(), offset = 20, scrollBarWidth = device === 1 ? 20 : 0;;
            pos.y = Math.min(pos.y, 0); // set max to 0
            const minY = (window.innerHeight - rect.height - parseInt(tabElement.css('bottom')) - offset) * -1;
            pos.y = Math.max(pos.y, minY);
            
            pos.x = Math.min(pos.x, 0);
            const minX = (window.innerWidth - rect.width - parseInt(tabElement.css('right')) - offset - scrollBarWidth) * -1;
            pos.x = Math.max(pos.x, minX);
            return pos;
        }
    }

    const InverseTab = new function() {
        this.init = function () {
            setTimeout(checkTabPosition, 1000);
            window.addEventListener("scroll", debounce(checkTabPosition, 15));
            window.addEventListener("resize", debounce(checkTabPosition, 15));
            _insideGraph.bind("closechat", function(){
                setTimeout(checkTabPosition, 300);
            });
        }

        function debounce(func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }
    
        this.checkTabPosition = checkTabPosition;
        function checkTabPosition() {
            const tab = document.getElementById('inside_genericTab');
            const footers = document.querySelectorAll('.with-theme-footer, #footer-main, #footer-new-exp, [data-testid="footer-container"]');
            // Check if tab overlaps with any footer
            const tabTop = tab.getBoundingClientRect().top;
            const tabBottom = tabTop + 33; // Assuming 33px is the tab height

            const inverse = Array.from(footers).some(footer => {
                const footerRect = footer.getBoundingClientRect();
                // Check if tab overlaps with this footer's vertical space
                return tabBottom > footerRect.top && tabTop < footerRect.bottom;
            });

            tab.classList[inverse ? 'add' : 'remove']('inverse');
        }
    }

    //#region common functions
    function isiOSSafari() {
        var userAgent = navigator.userAgent;
        var isIPadPro = /Macintosh/.test(userAgent) && 'ontouchend' in document;
        return (isIPadPro || /iP(ad|od|hone)/i.test(userAgent)) && /WebKit/i.test(userAgent) && !(/(CriOS|FxiOS|OPiOS|mercury)/i.test(userAgent));
    }

    function loadCustomCss(filePath, callback) {
        _insideGraph.loadCSS(filePath, function () {
            if (callback) callback();
            insideFrontInterface.windowScale()
        });
    }

    function loadCustomCssForTheme(filePath, id) {
        chatDocument.find('body').prepend('<link id="' + id + '" rel="stylesheet" type="text/css" media="all" href="' + filePath + '">');
    }

    function getCustomFilePath(fileName, noWebsiteId) {
        return _insideCDN + 'custom/' + (noWebsiteId ? '' : (websiteId + '-')) + fileName + '?v=' + _insideScriptVersion;
    }

    function resetPrechat(clearDepartment) {
        if (clearDepartment == true) resetDepartment();
        insidePreChatForm.prechatFilled = false;
        if (chatDocument) {
            chatDocument.find('#inside_prechatForm').remove();
            chatDocument.find('#insideChatPane').removeClass('hideMessages');
        }
    }

    function resetDepartment() {
        if ((typeof insideChatPane !== "undefined" && insideChatPane.activeChat) || (isProactiveChat() && chatDocument && chatDocument.find('#insideChatPane').attr('prechat-type') !== 'video') || $('#inside_holder').hasClass('videoChat')) return;
        insideAPI.post("api/visitor/set_department", { department: '' });
        insideFrontInterface.chat.deptChosen = false;

        if (chatDocument) chatDocument.find('#insideChatPane').removeClass('disableChatOnVideoCall');
    }
    function isProactiveChat() {
        return (typeof insideChatPane !== "undefined" && insideChatPane.lastMessageFrom_customVariable && insideChatPane.lastMessageFrom_customVariable.search('assistant') > -1 && !insideChatPane.activeChat && !insideChatPane.chatEnded);
    }

    function translate(str) {
        try {
            return config.translations[str][insideFrontInterface.chatSettings.langCode] || str;
        } catch (e) {
            return str;
        }
        return str;
    }
    //#endregion

    function loadLegacyFiles() {
        loadCustomCss(getCustomFilePath('gucci-legacy.css'));
        _insideGraph.loadJS(getCustomFilePath('gucci-legacy.js'));
    }

    // wait until Inside is loaded
    _insideGraph.defer(function () {
        websiteId = insideFrontInterface.chat.userid.split(':')[1];
        device = $.inside.front.getDevice();
        isMobileDevice = device === 2;

        if(config.videoSurveyId == 0) {
            config.videoSurveyId = insideFrontInterface.chatSettings.postChatSurvey;
        }
        if (typeof config.videoChatLocation === 'object')  {
            var videoChatLocation = '';
            for (const key in config.videoChatLocation) {
                const url = config.videoChatLocation[key];
                if (url === "*" || location.href.search(url) > -1) {
                    videoChatLocation = key;
                }
            }
            config.videoChatLocation = videoChatLocation;
        }

        $('#inside_holder').attr('chatpaneversion', insideFrontInterface.chatPaneVersion());
        if (insideFrontInterface.chatPaneVersion() == 1) {
            loadLegacyFiles();
            window['_insideCustomScriptLoaded'] = true;
        } else if (insideFrontInterface.chatSettings.name.toLowerCase().search('gucci') > -1) {
            useNewDesign = insideFrontInterface.chat.data.flags.indexOf('Old Design') === -1;
            initCustomTabs();
            if(useNewDesign) {
                $('#inside_holder, #inside_custom_tab_holder').addClass('newDesign');
            }
            initChatLinks();
            _insideGraph.defer(initCustomTheme, function () { return typeof insideChatPane !== "undefined" && insideChatPane.frame });
        }
    }, function () {
        return typeof insideFrontInterface != "undefined" && insideFrontInterface.chat && insideFrontInterface.chatPaneVersion;
    });

    // reset department after page load if chat is not active
    _insideGraph.defer(function () {
        if ((!isCsAvailable() || (typeof insideChatPane == 'undefined' || insideChatPane.activeChat != true)) && (typeof insideFrontInterface.chat.data.chats === "undefined" || insideFrontInterface.chat.data.chats.length === 0))
            resetDepartment();
    }, function () {
        return typeof insideFrontInterface !== "undefined" && insideFrontInterface.chat && insideFrontInterface.chat.data && insideFrontInterface.chatReady;
    })

    // set department if active chat is loaded
    _insideGraph.defer(function () {
        if (isCsAvailable && typeof insideFrontInterface.chat.data.chats !== "undefined" && insideFrontInterface.chat.data.chats.length > 0)
            setDepartment('Client Advisor');
    }, function () {
        return typeof insideChatPane !== "undefined" && insideFrontInterface.chat.settings && insideFrontInterface.chat.data;
    })

    function isCsAvailable() {
        var endedByCustomer = typeof insideChatPane !== 'undefined' && insideChatPane.getChatEndedByCustomer && insideChatPane.getChatEndedByCustomer();
        if(endedByCustomer && lastAssistantName) {
            config.csChannels.push(lastAssistantName);
            lastAssistantName = '';
        }
        return insideFrontInterface.getAvailableAssistants().filter(function (o) { return $.inArray(o.name, config.csChannels) > -1 }).length > 0; // checking channels only
    }

    function isVideoAvailable() {
        return _insideGraph.video && !$('#inside_holder').hasClass('iOSChrome') && insideFrontInterface.getAvailableAssistants().filter(function (o) { return $.inArray(o.name, config.videoChannels) > -1 }).length > 0;
    }

    function checkAvailableAssistants() {
        var chatModuleLoaded = typeof insideChatPane !== "undefined";

        // in case of operator offline after visitor receiving proactive chat
        var csAvailable = isCsAvailable();
        if (csAvailable || (chatModuleLoaded && insideChatPane.activeChat)) customTabHolder.addClass('chatAvailable')
        else customTabHolder.removeClass('chatAvailable')
        var videoAvailable = isVideoAvailable();
        if (videoAvailable) customTabHolder.addClass('videoAvailable')
        else customTabHolder.removeClass('videoAvailable');

        // don't close the chat pane if there is a survey open
        var postChatSurveyOpen = chatModuleLoaded && insideChatPane.frame && insideChatPane.frame.contentWindow.document.querySelector(".surveyQuestionContainer.opened") !== null;
        if (chatModuleLoaded && typeof insideChatPane.isOpen === "function" && insideChatPane.isOpen() && !csAvailable && !videoAvailable && !$(insideChatPane.chatPane).hasClass("disableChatOnVideoCall") && insideChatPane.activeChat != true && !postChatSurveyOpen && !document.getElementById("inside_holder").classList.contains("videoPopup")) {
            insideChatPane.close();
        }

        if (chatModuleLoaded && !csAvailable && isProactiveChat() && insideChatPane.isOpen() && customTabHolder.hasClass('connecting-video') == false) {
            $.inside.server.stopChat(insideFrontInterface.currentChatId || 0);
            if(!postChatSurveyOpen) {
                insideChatPane.close();
            }
        }

        _insideGraph.defer(function() {
            _insideGraph.doEvent('chatavailable', csAvailable);
        }, function() {
            return typeof window.onChatAvailable === 'function';
        });
        _insideGraph.defer(function() {
            _insideGraph.doEvent('videochatavailable', videoAvailable);
        }, function() {
            return typeof window.onVideoChatAvailable === 'function';
        });
        
    }

    let disconnectedCounter = 0, connectedCounter = 0;
    function disconnectedFromInside() {
        checkAvailableAssistants();
        chatSettings = insideFrontInterface.chat.settings;
        departmentSelected = false;
        disconnectedCounter++;
    }

    function connectedToInside() {
        if (typeof chatSettings !== "undefined") insideFrontInterface.chat.settings = chatSettings;

        var activeChat = typeof insideChatPane !== "undefined" && insideChatPane.activeChat !== true;
        // fix bug #32023 (CASE 2)
        if(activeChat && isCsAvailable() && sessionStorage.getItem('insidePreChatType') === 'chat') {
            setDepartment('Client Advisor');
        } else if(!activeChat) {
            resetDepartment();
        }
        checkAvailableAssistants();
        departmentSelected = false;
        connectedCounter++;
    }

    function chatReceived(data) {
        const lastMessage = Array.isArray(data) ? data[data.length - 1] : data.message;
        insideChatPane.chatEnded = false;
        insideChatPane.chatEndedByOperator = false;
        insideFrontInterface.currentChatId = lastMessage.chatid;
        if (lastMessage.text == "/stopchat") {
            if(!postChatSurveyVideo && (insideChatPane.chatPane.classList.contains("notificationMode") || insideChatPane.getChatEndedByCustomer())) {
                insideChatPane.close();
            }
            insideChatPane.clearNotifications(); //remove chat notifications if chat ends
            insideChatPane.chatEnded = true;
            insideChatPane.chatEndedByOperator = true;
            insideChatPane.setChatEndedByCustomer(true); // to skip 3s delay 
            _insideGraph.defer(function () {
                chatDocument.find('#startANewChatButton').click(function (e) {
                    insideChatPane.removeStartANewChatButton();
                    setDepartment('Client Advisor');
                    e.preventDefault();
                    e.stopPropagation();
                })
            }, function () {
                return chatDocument.find('#startANewChatButton').length > 0;
            });
            customTabHolder.removeClass('connecting-video');
            chatDocument.find('#insideChatPane').removeClass('connecting-video');
            // fix bug #32023 (CASE 1)
            if(insideChatPane.isOpen() && sessionStorage.getItem('insidePreChatType') === 'chat') {
                setDepartment('Client Advisor');
            }
        } else if(lastMessage.text === "Video chat requested by the customer.") {
            videoEventTracking('call_requested', {
                callId: insideFrontInterface.currentChatId.toString(),
                callerId: insideFrontInterface.chat.userid
            });
            sessionStorage.setItem("insideCallRequested", (new Date()).getTime());
            insideChatPane.showNotification(insideFrontInterface.chatSettings.chatPane.queueVideoOnlyMessage || 'Connecting...', "queue", false, false, true);
        } else if (lastMessage.text.search('Operator does not have a Video Chat Role') > -1) {
            insideChatPane.close();
            customTabHolder.removeClass('connecting-video');
            chatDocument.find('#insideChatPane').removeClass('connecting-video');
            checkAvailableAssistants();
        } else if (lastMessage.fromid.split(':')[0] === 'assistant' && customTabHolder.hasClass('connecting-video')) {
            // in case of operator rejected the call and reply via chat
            chatDocument.find('#insideChatPane').attr('prechat-type', 'chat').removeClass('disableChatOnVideoCall');
            customTabHolder.removeClass('connecting-video');
            chatDocument.find('#insideChatPane').removeClass('connecting-video');
        }

        if(lastMessage.fromid.split(':')[0] === 'user') {
            insideChatPane.activeChat = true;
        }
        sessionStorage.setItem("insideChatActive", insideChatPane.activeChat);
        sessionStorage.setItem("cookies-accepted", "true"); // if chats are received, cookies have been accepted.

        insideChatPane.lastMessageFrom_customVariable = lastMessage.fromid;
        if(isProactiveChat() && typeof insideChatPane !== "undefined" && insideChatPane.isOpen && insideChatPane.isOpen()) {
            insideChatCategory = 'Inside : Proactive Chat';
            sessionStorage.setItem('insideChatCategory', insideChatCategory);
            chatEventTracking(insideChatCategory, 'view');
        }


        //showCloseOnTab();
    }

    var openPaneFromChatLnk = false;
    function initChatLinks() {
        // override chat button click to trigger GA event
        _insideGraph.defer(function () {
            let openChatButtonClicked = false;
            var gtmOpenChatButtonClick = window.openChatButtonClick;
            window.openChatButtonClick = function() {
                if(isCsAvailable() === false || openChatButtonClicked) { 
                    return; 
                }
                // prevent duplicate calls
                openChatButtonClicked = true;
                setTimeout(function () {
                    openChatButtonClicked = false;
                  }, 500)
                openPaneFromChatLnk = true;
                setPrechatSettings('chat');
                if(typeof insideChatPane === "undefined") {
                    loadInsideChat(window.openChatButtonClick);
                    return;
                }
                gtmOpenChatButtonClick();

                const contactUsDrawerIsOpen = $('#contact_us_drawer_id[is="open"]').length > 0;
                if(contactUsDrawerIsOpen) {
                  chatEventTracking('live chat', 'click live chat contact drawer', 'Live Chat');
                } else {
                  chatEventTracking(insideChatCategory || 'Inside : Reactive Chat', location.href.search('st/contact-us') > -1 ? 'click contact us' : 'click may we help');
                }
            };
            window.chat_buttons = document.querySelectorAll("div.item.live-chat button,.client-services-item-container .chat-button button,.client-services-chat-container button");
            for (const element of window.chat_buttons) {
                element.addEventListener("click", window.openChatButtonClick);
                element.removeEventListener("click", gtmOpenChatButtonClick);
            }
        }, function() {
            return typeof window.openChatButtonClick === 'function';
        });

        _insideGraph.defer(function () {
            var gtmOpenVideoButtonClick = window.openVideoButtonClick;
            window.openVideoButtonClick = function() {
                if(isVideoAvailable() === false) { return; }
                if(typeof insideChatPane === "undefined") {
                    loadInsideChat(window.openVideoButtonClick);
                    return;
                }
                gtmOpenVideoButtonClick();
                videoEventTracking('video_button_clicked', {
                    page: {
                        url: document.location.href,
                        title: document.title,
                        timestamp: (new Date).getTime()
                    }
                }); 
            };
            window.video_button = document.querySelectorAll(".call-button-container .video-call-button, .videocall-desktop a:first-child, .videocall-mobile a:first-child");
            for (const element of window.video_button) {
                element.addEventListener("click", window.openVideoButtonClick);
                element.removeEventListener("click", gtmOpenVideoButtonClick);
            }
        }, function() {
            return typeof window.openVideoButtonClick === 'function';
        });
    }

    function initCustomTabs() {
        // Detect if Qubit popups exists then adjust chat tab position accordingly
        setInterval(function () {
            var popup = $("[class^='lightbox-'], .mobile #capsule-wrapper._active, .bx-creative");
            var h = popup.length > 0 ? popup.outerHeight() : 0;
            if(document.querySelector('[class*="page-transition"]')) {
              h = 80;
            }
            document.getElementById('inside_custom_tab_holder').style.setProperty('--qubit-popup-height', h + 'px');
            document.getElementById('inside_holder').style.setProperty('--qubit-popup-height', h + 'px');
        }, 500);

        if (insideFrontInterface.chatSettings.chatTab.hideChatTab && insideFrontInterface.chatSettings.chatTab.hideChatTabOnDevices.indexOf(device.toString()) > -1) {
            $('#inside_holder').addClass('hideTabs');
        }

        if ($('body').hasClass('cookie-banner-visible') || $('#onetrust-accept-btn-handler').is(':visible')) {
            $('#inside_holder').addClass('cookie-banner-visible');
            $('#onetrust-accept-btn-handler').click(function () {
                $('#inside_holder').removeClass('cookie-banner-visible');
            })
        }

        var customTabs = getChatBubbleHtml(svgVideoTab, translate('Discover how to reach an Advisor live'), 'inside_videoTab');
        customTabs += getChatBubbleHtml(svgChatTab, translate('Chat with an Advisor'), 'inside_chatTab');
        customTabs += getChatTabHtml((isMobileDevice ? svgTabMobile : svgTab), 'inside_genericTab');

        if(device === 1) {
            //$('#inside_holder').insertAfter('div[class^="SkipToMainContent"]');
        }
        $('#inside_holder').after('<div id="inside_custom_tab_holder" style="visibility:hidden;"><div id="inside_custom_tabs">' + customTabs + '</div></div>');
        customTabHolder = $('#inside_custom_tab_holder');
        
        const chatModuleIsLoading = function() {
            const isLoading = $('#inside_chatTab').hasClass('loading') || $('#inside_videoTab').hasClass('loading');
            if(isLoading && !_insideGraph.getModule('chat')) {
                _insideGraph.loadJS(_insideCDN + "/js/frontend-chat.js.bundle?v=" + _insideScriptVersion);
            }
            return isLoading;
        }
        customTabHolder
            .on('click', '#inside_genericTab, #insideTabOverlay', function() {
                if($('#inside_genericTab').hasClass('clicked')) return;

                $('#inside_genericTab').addClass('clicked');
                setTimeout(() => {
                    $('#inside_genericTab').removeClass('clicked')
                }, 200);

                genericTabClick();
            })
            .on('click', '#inside_chatTab', function() {
                if(chatModuleIsLoading()) {
                    return;
                }
                chatTabClick();
                chatEventTracking('Inside : Reactive Chat', 'chatclick');
            })
            .on('click', '.inside_customNotification', function() {
                chatTabClick();
                chatEventTracking(insideChatCategory || 'Inside : Proactive Chat', 'click', 'text');
            })
            .on('click', '#inside_videoTab', function() {
                if(chatModuleIsLoading()) {
                    return;
                }
                videoTabClick();
                chatEventTracking('Inside : Reactive Chat', 'videoclick');
            })
            .on('click', '#inside_removeTabs', removeTabsClick);

        if(isMobileDevice) {
            customTabHolder.addClass('mobile-device').append('<div id="insideTabOverlay"></div>');
        } else {
            $('#inside_genericTab').append(svgTabClose);
        }

        showCloseOnTab();
        DraggableTab.init();
        InverseTab.init();

        //#region bind custom event handler

        if(!useNewDesign) {
            // animation only on initial page load
            if(sessionStorage.getItem('insideStopAnimation') === 'true') {
                customTabHolder.addClass('stopAnimation');
            } else {
                sessionStorage.setItem('insideStopAnimation', 'true');
            }
        }

        // display chatnotification as over chat tab
        var notificationList = JSON.parse(sessionStorage.getItem('insideNotificationList')) || [];
        _insideGraph.bind("chatnotification", function (data) {
            insideChatPane.chatEnded = false;

            var message = data.message;
            insideChatPane.lastMessageFrom_customVariable = message.fromid;
            if (message.text.indexOf("[Image:") === 0) {
                message.text = message.fromname + ' ' + insideChatPane.translate("Sent an image");
            } else if (message.text.indexOf("[Audio:") === 0) {
                message.text = message.fromname + ' ' + insideChatPane.translate("Sent an audio file");
            } else if (message.text.indexOf("[File:") === 0) {
                message.text = message.fromname + ' ' + insideChatPane.translate("Sent a file");
            } else if (message.text.indexOf("[Video:") === 0) {
                message.text = message.fromname + ' ' + insideChatPane.translate("Sent a video");
            }
            
            var addMessageBubble = function (message) {
                customTabHolder.removeClass('expanded')
                $('.inside_customNotification').remove(); // remove previous message
                $('#inside_genericTab').before(getChatBubbleHtml(svgChatTab, message.text, 'inside_customNotification' + message.id, 'inside_customNotification'));
            }

            if($('#inside_customNotification' + message.id).length > 0) {
                return; // handle the case when notification event triggered twice from the core.
            }
            
            if(notificationList.indexOf(message.id) > -1) {
                // show dot only after page reload
                addNotificationDot();
                if(isMobileDevice) {
                    addMessageBubble(message);
                }
                return;
            }
            
            notificationList.push(message.id);
            sessionStorage.setItem('insideNotificationList', JSON.stringify(notificationList));

            // add message bubble to #inside_custom_tabs
            // desktop/tablet will have slide in animation
            // mobile will be hidden and shown when visitor click on #inside_genericTab 
            addMessageBubble(message);

            if(isProactiveChat()) {
                insideChatCategory = 'Inside : Proactive Chat';
                sessionStorage.setItem('insideChatCategory', insideChatCategory);
                chatEventTracking(insideChatCategory, 'view');
            }

            if(insideChatPane.isOpen() === false) {
                addNotificationDot();
            }
            
            if(!isMobileDevice) {
                // timeout to wait for message slide in animation (1.5s) and 3s / 6s (new design) for visitor to see the message
                setTimeout(function() {
                    $('#inside_customNotification' + message.id).addClass('slide-out-right');
                    setTimeout(function () {
                        $('#inside_customNotification' + message.id).remove();
                    }, 600)
                }, useNewDesign ? 7500 : 4500);
            }
            
        });

        function addNotificationDot() {
            $('.inside_customNotificationDot').remove();
            var unreadCount = '';
            if(useNewDesign) {
                var c = insideFrontInterface.chat.unreadMessageCount || 1;
                unreadCount = (c > 9 ? '9+' : c);
            }
            $('#inside_genericTab').addClass('animateTabIcon').append('<i class="inside_customNotificationDot">' + unreadCount + '</i>');
            if(!isProactiveChat()) chatEventTracking(insideChatCategory, 'view green bubble');
        }

        $.inside.bind("startVideoChat", function (data) {
            insideChatPane.frame.contentWindow.insideSurvey2.loadSurveyData(insideChatPane.settings.chatSettings.postChatSurvey);
            operatorId = (data.operatorId || '').toString();
            operatorName = data.operatorName || '';
            customTabHolder.removeClass('connecting-video');
            chatDocument.find('#insideChatPane').removeClass('connecting-video');
            insideFrontInterface.chatSettings.chatPane.height = 635;
            chatDocument.find('#insideChatPane').attr('prechat-type', 'video');
            
            if(insideFrontInterface.videoChatRequested) {
                var insideCallRequested = sessionStorage.getItem("insideCallRequested");
                videoEventTracking('call_connected', {
                    callId: insideFrontInterface.currentChatId.toString(),
                    answerDuration: (new Date() - new Date(parseInt(insideCallRequested))),
                    agentId: operatorId,
                    agentName: operatorName
                }); 
                sessionStorage.removeItem("insideCallRequested"); 
                sessionStorage.setItem("insideCallEstablished", (new Date()).getTime());

                // preload postchat questions
                insideChatPane.frame.contentWindow.insideSurvey2.loadSurveyData(config.videoSurveyId);
            }
        });

        $.inside.bind("endVideoChat", function () {
            customTabHolder.removeClass('connecting-video');
            chatDocument.find('#insideChatPane').removeClass('connecting-video');
            // trigger post chat survey
            _insideGraph.defer(function () {
                setTimeout(openPostChatSurvey, 50);
            }, function() {
                return insideFrontInterface.currentChatId && insideFrontInterface.currentChatId > 0;
            });
        });

        function openPostChatSurvey() {
            if (sessionStorage.getItem('insidePreChatType') === 'video' && insideFrontInterface.chatSettings && insideFrontInterface.chatSettings.postChatSurvey) {
                insideChatPane.setChatEndedByCustomer(true);
                $.inside.client.doEvent('insideAction', {
                    type: "chatsurvey",
                    settings: { surveyid: config.videoSurveyId, force: true },
                    chatid: insideFrontInterface.currentChatId
                });
                postChatSurveyVideo = true;
                insideFrontInterface.chatSettings.chatPane.height = initialChatPaneHeight;
            }
        }

        // Remove visitor call duration timer from visitor screen (Jira 18744)
        $.inside.bind("callEstablished", function (data) {
            chatDocument.find('#insideVideoFrame')[0].contentWindow.postMessage({
                'source': 'inside',
                'name': 'add-custom-css',
                'payload': { css: ".timeContainer{display:none;} body:not(.operator) .remoteMediaContainer{top:16px;}" }
            }, "*");
        });

        $.inside.bind("errorNotification", function (data) {
            customTabHolder.removeClass('connecting-video');
            chatDocument.find('#insideChatPane').removeClass('connecting-video');
        });

        window['_insideCustomScriptLoaded'] = true;
        insideFrontInterface.bind("assistants", checkAvailableAssistants);

        setTimeout(checkAvailableAssistants, 500);

        $.inside.bind("connected", connectedToInside);
        $.inside.bind("disconnected", disconnectedFromInside);
        $.inside.bind("chat", chatReceived);
        $.inside.bind("insideAction", function (data, stickyid, renderAsPopup) {
            if (data.type == "chatsurvey") {
                $.inside.server.unstick(stickyid);
            }
        });

        initialChatPaneHeight = insideFrontInterface.chatSettings.chatPane.height;

        // handle chat ended by visitor
        const checkPostChatSurvey = function () {
            const reconnected = disconnectedCounter > 0 && connectedCounter > 0;
            const surveyContainer = insideChatPane.frame.contentDocument.querySelector('.surveyQuestionContainer');
            if(reconnected && insideFrontInterface.chatSettings.postChatSurvey && !surveyContainer) {
                $.inside.client.doEvent('insideAction', {
                    type: "chatsurvey",
                    settings: { surveyid: insideFrontInterface.chatSettings.postChatSurvey, force: true },
                    chatid: insideFrontInterface.currentChatId
                });
            }
        }
        _insideGraph.bind('chatended', function (endedData) {
            if(isProactiveChat() && !insideChatPane.isOpen()) {
                insideChatPane.close();
            }

            insideChatPane.chatEnded = true;
            insideChatPane.removeNotification('endchat');
            var postChatSurveyOpen = insideChatPane.frame.contentWindow.document.querySelector(".surveyQuestionContainer.opened") !== null;
            if (!postChatSurveyOpen && sessionStorage.getItem('insidePreChatType') === 'chat') {
                insideChatPane.close();
            }

            if(insideFrontInterface.videoChatRequested) {
                var data = {
                    callId: insideFrontInterface.currentChatId.toString(),
                    userHangup: false,
                    userCanceled: false,
                    missed: false,
                    callDuration: 0,
                    agentId: operatorId,
                    agentName: operatorName
                };
                if(endedData.endedBy === "visitor") {
                    data.userCanceled = true;
                } else if(endedData.endedBy === "operator") {
                    data.missed = true;
                }
                videoEventTracking('call_ended', data); 
                insideFrontInterface.videoChatRequested = false;
                $(insideChatPane.chatPane).addClass('videoCallMissed');
                setTimeout(insideChatPane.close, 6000);
            }

            if(sessionStorage.getItem('insidePreChatType') === 'chat') {
                chatEventTracking(insideChatCategory, 'close');
            }

            if(endedData.endedBy === "operator") {
                insideChatCategory = null;
                sessionStorage.removeItem('insideChatCategory');
                sessionStorage.removeItem('insideChatActive');
            } else {
                lastAssistantName = insideFrontInterface.getLastMessageAssistantName();
            }

            // check post chat survey #49465
            if(insideChatPane.activeChat) {
              setTimeout(checkPostChatSurvey, 1000);
            }
        });

        //#endregion

        //#region custom event tracking
        insideChatCategory = sessionStorage.getItem('insideChatCategory');

        _insideGraph.bind("googleAnalytics", function (event) {
            console.log('googleAnalytics', event);
            if(event.action === 'Started' || event.action === 'Active') {
                //console.trace('GATrackEvent (core)', event);
                insideChatCategory = event.category;
                sessionStorage.setItem('insideChatCategory', insideChatCategory);

                // preload postchat questions
                _insideGraph.defer(function() {
                    insideChatPane.frame.contentWindow.insideSurvey2.loadSurveyData(insideChatPane.settings.chatSettings.postChatSurvey);
                }, function() {
                    return typeof insideChatPane !== 'undefined' && insideChatPane.frame;
                });
                
            }
        });

        var trackingList = [];
        _insideGraph.bind('videochatavailable', function(available){ 
            var tabHidden = $('#inside_holder').hasClass('hideTabs');
            var chatActive = sessionStorage.getItem('insideChatActive') === 'true';
            if(available && trackingList.indexOf('tab_shown') == -1 && (!tabHidden || chatActive) ) {
                videoEventTracking('tab_shown');
                trackingList.push('tab_shown');
            }
        })

        _insideGraph.bind('chatavailable', function(available) { 
            // waiting for chat data
            _insideGraph.defer(function () {
                var tabHidden = $('#inside_holder').hasClass('hideTabs');
                var chatActive = sessionStorage.getItem('insideChatActive') === 'true';
                if(available && trackingList.indexOf('reactive_chat_view') == -1 && !tabHidden && (insideChatCategory == null || !chatActive)) {
                    chatEventTracking('Inside : Reactive Chat', 'view');
                    trackingList.push('reactive_chat_view');
                }
                DraggableTab.adjustPosition();
            }, function () {
                return typeof insideFrontInterface !== "undefined" && insideFrontInterface.chat && insideFrontInterface.chat.data;
            })
        })

        $.inside.bind("videoOnHold", function() {
            sessionStorage.setItem("insideCallHold", 'true');
            videoEventTracking('call_hold', {
                callId: insideFrontInterface.currentChatId.toString(),
                agentId: operatorId,
                agentName: operatorName
            }); 
        });
        $.inside.bind("videoResume", function() {
            if(sessionStorage.getItem("insideCallHold") === 'true') {
                videoEventTracking('call_resumed', {
                    callId: insideFrontInterface.currentChatId.toString(),
                    agentId: operatorId,
                    agentName: operatorName
                });
                sessionStorage.removeItem("insideCallHold");
            }
        });

        $.inside.bind("videoTransferRequested", function(conversationId) {
            let videoTransferMessage = insideFrontInterface.chatSettings.chatPane.videoTransferMessage || `Your conversation will now be transferred to a dedicated Client Advisor from our digital Showroom.
            <br><br>Please follow the next steps to be connected and start your experience.`;
            videoTransferMessage = `<div class='videoTransferMessage'>${videoTransferMessage}</div>`;
            
            let videoTransferButton = insideFrontInterface.chatSettings.chatPane.videoTransferButton || 'Start Your Visit';
            videoTransferButton = `<button id="videoTransferButton" class="insideSubmitButton" tabindex="0" type="button">${videoTransferButton}</button>`;

            $(insideChatPane.chatPane).append(`<div class='videoTransferNotification insideSelectMenu'>
            <div class="sk-fading-circle"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>
            ${videoTransferMessage + videoTransferButton}
            </div>`);
            $(insideChatPane.chatPane).find('#videoTransferButton').click(function () {
                videoTabClick();
                $(insideChatPane.chatPane).addClass('transferVideoChannel');
                insidePreChatForm.show();
                setTimeout(startYourVisit, 500);
                setTimeout(function () {
                    $(insideChatPane.chatPane).removeClass('transferVideoChannel');
                }, 1000);
                $(insideChatPane.chatPane).find('.videoTransferNotification').remove();
            });
        });

        //#endregion
    }

    function initCustomTheme() {
        chatDocument = $(insideChatPane.frame.contentDocument);
        chatDocument.find('#inside_holder').attr('lang', insideFrontInterface.chatSettings.langCode);
        loadCustomCssForTheme(getCustomFilePath('gucci-custom-prechat.css', _insideCluster === 'ussandbox'), 'customPrechatCSS');

        var coreCloseChatPane = insideChatPane.close;
        insideChatPane.close = function (fromUser) {
            if(fromUser && insideChatPane.isOpen()) {
                if(sessionStorage.getItem('insidePreChatType') === 'video') {
                    videoEventTracking('tab_closed'); 
                } else if(sessionStorage.getItem('insidePreChatType') === 'chat') {
                    chatEventTracking(insideChatCategory || 'Inside : Reactive Chat', 'minimize');
                } 
            }

            if (!customTabHolder.hasClass('connecting-video') && !$('#inside_holder').hasClass('videoChat')) {
                resetDepartment();
            }

            // trigger back to show/video when minimizing the chat pane
            const insideChatPaneVideosButton = $(insideChatPane.chatPane).find('#insideChatPaneVideosButton')
            if(fromUser && insideChatPaneVideosButton.length && !$(insideChatPane.chatPane).hasClass('video')) {
              $(insideChatPane.chatPane).find('#insideChatPaneVideosButton').click();
              insideChatPane.close();
            }

            customTabHolder.show();
            coreCloseChatPane(fromUser);
            closePostChatSurvey();
            
            //show tab on active chat
            var csAvailable = isCsAvailable();
            if (csAvailable || insideChatPane.activeChat) customTabHolder.addClass('chatAvailable');
            else customTabHolder.removeClass('chatAvailable');
            var videoAvailable = isVideoAvailable();
            if (videoAvailable) customTabHolder.addClass('videoAvailable');
            else customTabHolder.removeClass('videoAvailable');

            // reset prechat-type attribute
            if (!insideChatPane.activeChat && !_insideGraph.jQuery.inside.videoChat) {
                chatDocument.find('#insideChatPane').removeAttr('prechat-type');
            }

            $('#inside_genericTab').focus();
        }

        // close chat pane on post chat survey close
        insideFrontInterface.surveyCompleteCallback = function () {
            setTimeout(insideChatPane.close, 2500);
            
            postChatSurveyVideo = false;
        }
        chatDocument.on('click', '.surveyQuestionContainer .icon-close, .insidePostChatSurveyCloseButton', function () {
            // reset prechat-type attribute
            if (!insideChatPane.activeChat && !_insideGraph.jQuery.inside.videoChat) {
                chatDocument.find('#insideChatPane').removeAttr('prechat-type');
            }

            // trigger back to show/video when minimizing the chat pane
            const insideChatPaneVideosButton = $(insideChatPane.chatPane).find('#insideChatPaneVideosButton')
            if(insideChatPaneVideosButton.length && !$(insideChatPane.chatPane).hasClass('video')) {
              $(insideChatPane.chatPane).find('#insideChatPaneVideosButton').click();
              insideChatPane.close();
            }

            coreCloseChatPane();
            
            postChatSurveyVideo = false;
        });

        // fix bug #32023 (CASE 1) - set department before sending the message
        insideChatPane.beforeSendChat = function (sendChat) {
            if(typeof sendChat === 'undefined') {
                sendChat = function() { console.log('sendChat'); };
            }
            if (!departmentSelected) {
                setDepartment('Client Advisor', function(response) {
                    _insideGraph.defer(sendChat, function () {
                        return insideFrontInterface.getAvailableAssistants().length;
                    });
                });
                departmentSelected = true;
            } else sendChat();
        }

        // custom disclaimer
        chatDocument.on('click', '#inside-disclaimer-checkbox1, #inside-disclaimer-checkbox2', function (e) {
            var checkbox1 = chatDocument.find('#inside-disclaimer-checkbox1').prop("checked") === true;
            var checkbox2 = chatDocument.find('#inside-disclaimer-checkbox2').prop("checked") === true;
            if(checkbox1 && !checkbox2) {
                chatDocument.find('#inside_prechatForm').animate({scrollTop: 700}, 1500);
            } else if(checkbox1 && checkbox2) {
                chatDocument.find('#inside_prechatForm').hide();
                chatDocument.find('#inside_disclaimer_agree').click();
                chatDocument.find('#prechatSubmitButton').click();
            }
        });

        // to fix bug #29011
        chatDocument.on('click', '.chatNotification', function (e) {
            if (e.target.className != "closeButton" && e.target.className != "icon-close") {
                setTimeout(function () {
                    insideChatPane.open(true);
                }, 200)
            }
        });

        insideChatPane.frame.contentWindow.addEventListener("message", function(e){
            if (e.origin !== new URL(_insideSocialUrl).origin) {
                return;
            }
            var message = e.data;
            if(typeof message === "undefined" || message.source !== "inside-video") {
                return;
            }
            if(message.name === 'resumeAudio') {
                videoEventTracking('audio_toggled', {
                    audioEnabled: true
                });
            } else if(message.name === 'pauseAudio') {
                videoEventTracking('audio_toggled', {
                    audioEnabled: false
                });
            } else if(message.name === 'visitorclosed' || message.name === 'operatorclosed') {
                var insideCallEstablished = sessionStorage.getItem("insideCallEstablished");
                if(insideCallEstablished) {
                    videoEventTracking('call_ended', {
                        callId: insideFrontInterface.currentChatId.toString(),
                        userHangup: message.name === 'visitorclosed',
                        userCanceled: false,
                        missed: false,
                        callDuration: (new Date() - new Date(parseInt(insideCallEstablished))),
                        agentId: operatorId,
                        agentName: operatorName
                    });
                    sessionStorage.removeItem("insideCallEstablished");
                }
            }
            
        });

        chatDocument.on('click', '.surveyQuestionContainer .surveyNextButton', function () {
            var surveyContainer = $(this).closest('.surveyQuestionContainer');
            if(postChatSurveyVideo && surveyContainer.hasClass('smiley')) {
                var eventType = surveyContainer.find('.selected').hasClass('insideSurveyQuestionImage2Yes') ? 'survey_happy_clicked' : 'survey_unhappy_clicked';
                videoEventTracking(eventType, {
                    callId: insideFrontInterface.currentChatId.toString()
                });
            } else if(postChatSurveyVideo && surveyContainer.hasClass('freeText'))  {
                videoEventTracking('survey_feedback_submitted', {
                    callId: insideFrontInterface.currentChatId.toString()
                });
            }
        });

        _insideGraph.defer(function () {
            var coreOpenChatPane = insideChatPane.open;
            insideChatPane.open = function (force, workflow, survey) {
                if(survey && sessionStorage.getItem('insidePreChatType') === 'chat') {
                    // set department again when the chat is ended by operator and the survey is shown to fix bug #32023
                    setDepartment('Client Advisor');
                } else if (survey && sessionStorage.getItem('insidePreChatType') === 'video') {
                    chatDocument.find('#insideChatPane').attr('prechat-type', 'video');
                } else if ($('#insideChatFrame').hasClass('notificationMode') || openPaneFromChatLnk || sessionStorage.getItem('insidePreChatType') === null) {
                    openPaneFromChatLnk = false;
                    // set department when visitor clicking on proactive notification or dynamic link
                    if(!insideChatPane.activeChat) {
                        resetPrechat();
                        insideChatPane.close();
                    }
                    setDepartment('Client Advisor');
                    chatDocument.find('#insideChatPane').attr('prechat-type', 'chat').removeClass('hideMessages');
                    setTimeout(showWelcomeMessage, 1000);
                    sessionStorage.setItem('insidePreChatType', 'chat');
                    setPrechatSettings('chat');
                    insideChatPane.showInputFooter();
                }

                coreOpenChatPane(force, workflow, survey);

                setTimeout(insideChatPane.scrollToBottom, 300);
            }

            insideChatPane.openVideoPopup = function () {
                videoTabClick();
            }

            // fix bug #32023 (CASE 3) 
            if(insideChatPane.isOpen()) {
                setTimeout(insideChatPane.scrollToBottom, 300);
                if(!document.getElementById("inside_holder").classList.contains("videoPopup") && !document.getElementById("inside_holder").classList.contains("videoFeedLoading")) {
                    insideChatPane.close();
                }
                if(sessionStorage.getItem('insidePreChatType') === 'video') {
                    videoTabClick();
                } else {
                    chatTabClick();
                }
            }
        }, function () {
            return typeof insideChatPane.open == "function";
        });

        // handle the case when visitor navigate to another page before chat got assigned to op
        if (insideFrontInterface.videoChatRequested) {
            customTabHolder.addClass('connecting-video')
            _insideGraph.defer(function () {
                if (insideChatPane.settings.preChat.disableChatOnVideoCall)
                    insideChatPane.chatPane.classList.add("disableChatOnVideoCall");
            }, function () {
                return typeof insideChatPane != 'undefined' && insideChatPane.settings && insideChatPane.chatPane;
            })

        }

        insideChatPane.customized = true;
    }

    function videoEventTracking(type, data) {
        var videoAssistantData = {
            eventCategory: "Powerfront Video Assistant",
            eventAction: type,
            company: config.videoChatCompany,
            location: config.videoChatLocation,
            ...data
        };
        console.log('videoAssistantData', videoAssistantData);
        window.dataLayer.push({ event: "videoChatEvent", videoAssistantData });
    }

    function chatEventTracking(category, action, label) {
        if(category === null) {
            category = isProactiveChat() ? 'Inside : Proactive Chat' : 'Inside : Reactive Chat';
            insideChatCategory = category;
        }
        var event = {
            category: category, 
            action: action,
            label: label
        };
        _insideGraph.doEvent("googleAnalytics", event);
    }

    function getChatEventLabel() {
        var label = "";
        if ($('#inside_custom_tab_holder').hasClass('chatAvailable') && $('#inside_custom_tab_holder').hasClass('videoAvailable')) {
            label = 'text+video';
        } else if ($('#inside_custom_tab_holder').hasClass('chatAvailable')) {
            label = 'text';
        } else if ($('#inside_custom_tab_holder').hasClass('videoAvailable')) {
            label = 'video';
        }
        return label;
    }

    function showWelcomeMessage() {
        if (insideFrontInterface.chatSettings.chatPane.showWelcomeMessage !== true || !chatDocument) return;
        if (chatDocument.find('.welcomeGreeting').length) {
            chatDocument.find('.welcomeGreeting').show();
        } else if (insideFrontInterface.chatSettings.chatPane.showWelcomeMessage && chatDocument.find('#insideChatPaneContent .message').length === 0) {
            insideChatPane.showSystemMessage(insideChatPane.getLanguageValue(insideFrontInterface.chatSettings.chatPane.welcomeMessage), "welcomeGreeting");
        }
    }

    function closePostChatSurvey() {
        try {
            var closeIcon = chatDocument.find('.surveyQuestionContainer .icon-close, .insidePostChatSurveyCloseButton');
            if (closeIcon.length > 0) closeIcon.click();
        } catch (e) { }
    }

    function setDepartment(departmentName, callback) {
        insideAPI.post("api/visitor/set_department", { department: departmentName }, function (response) {
            if(typeof callback === 'function') callback(response);
        });
        insideFrontInterface.chat.deptChosen = true;
    }

    function showCloseOnTab() {
        $('#inside_removeTabs').remove();
        var showCloseOnTab = $.inside.front.settings.showCloseOnTab;
        
        showCloseOnTab = []; // close tab will never show per new creative (2022)
        
        if (
            (device > 1 && showCloseOnTab.indexOf('mobile') > -1 && !insideChatPane.activeChat) ||
            (device > 1 && showCloseOnTab.indexOf('mobile_active') > -1 && insideChatPane.activeChat) ||
            (device == 1 && showCloseOnTab.indexOf('desktop') > -1 && !insideChatPane.activeChat) ||
            (device == 1 && showCloseOnTab.indexOf('desktop_active') > -1 && insideChatPane.activeChat)
        ) {
            $('#inside_genericTab').append('<div id="inside_removeTabs" ><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" fill-rule="nonzero" d="M6.085 7.5L0 1.415 1.415 0 7.5 6.085 13.585 0 15 1.415 8.915 7.5 15 13.585 13.585 15 7.5 8.915 1.415 15 0 13.585 6.085 7.5z"></path></svg></div>');
        }
    }

    //#region custom tabs
    function getChatTabHtml(svgImage, id) {
        return '<div aria-label="' + insideFrontInterface.chat.translate('Click here to choose either videocall or live chat option.') + '" id="' + id + '" onkeydown="if(event&amp;&amp;(event.keyCode==32||event.keyCode==13)){insideFrontInterface.keyboardNavigation=true; event.target.click(); return false;}" role="button" tabindex="0">' + svgImage + '<div class="wave"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
    }

    function getChatBubbleHtml(svgImage, label, id, className) {
        className = (className || '') + ' inside_chatBubble';
        var attr = 'class="' + className + '" ';
        if(id && id.length) {
            attr += 'id="' + id + '" ';
        }
        var labelHtml = '<label>' + label + '</label>';
        return '<div aria-label="' + label + '" ' + attr + ' onkeydown="if(event&amp;&amp;(event.keyCode==32||event.keyCode==13)){insideFrontInterface.keyboardNavigation=true; event.target.click(); return false;}" role="button" >' + labelHtml + svgImage +'</div>';
    }

    function updateThemeColor() {
        if(!isMobileDevice) return;

        $('meta[name="theme-color"]').attr('name', 'theme-color-temp');
        $('head').append('<meta name="theme-color" content="#686666">')
    }

    function resetThemeColor() {
        if(!isMobileDevice) return;

        $('meta[name="theme-color"]').remove();
        $('meta[name="theme-color-temp"]').attr('name', 'theme-color');
    }

    function genericTabClick() {
        const chatModuleLoaded = typeof insideChatPane !== "undefined";
        const chatIsEndedByCustomer = chatModuleLoaded && insideChatPane.getChatEndedByCustomer && insideChatPane.getChatEndedByCustomer() && !insideChatPane.chatEndedByOperator;
        const proactiveChatEnded = chatIsEndedByCustomer && insideChatPane.lastMessageFrom_customVariable && insideChatPane.lastMessageFrom_customVariable.search('assistant') > -1 && insideChatPane.chatPane.querySelectorAll('.message').length === 1;
        const proactiveChatOnDesktop = isProactiveChat() && isCsAvailable() && !isMobileDevice;
        const onlyChatAvailable = isCsAvailable() && !isVideoAvailable();
        
        if (customTabHolder.hasClass('expanded')) {
            customTabHolder.removeClass('expanded').find('.inside_chatBubble').removeAttr('tabindex');
            resetThemeColor();
            chatEventTracking('Inside : Reactive Chat', 'close option', getChatEventLabel());
        } else if ((chatModuleLoaded && insideChatPane.activeChat) || (chatIsEndedByCustomer && !proactiveChatEnded) || proactiveChatOnDesktop) {
            chatTabClick();
            if($('.inside_customNotificationDot').length) {
                chatEventTracking(insideChatCategory, isProactiveChat() ? 'click' : 'click green bubble');
            } else if(chatModuleLoaded && insideChatPane.activeChat) {
                if(insideChatPane.lastMessageFrom_customVariable && insideChatPane.lastMessageFrom_customVariable.search('user') > -1) {
                    chatEventTracking(insideChatCategory, 'click waiting');
                }
            } else {
                chatEventTracking(insideChatCategory, 'click', 'text');
            }
        } else if (customTabHolder.hasClass('connecting-video')) {
            videoTabClick();
        } else {
            if ((chatModuleLoaded && !insideChatPane.activeChat) && insideFrontInterface.chat.deptChosen) { resetDepartment(); }

            if(isMobileDevice && $('.inside_customNotification').length > 0 && $('.inside_customNotification:not(.seen)').length === 0) {
                chatTabClick();
                chatEventTracking(insideChatCategory, isProactiveChat() ? 'click' : 'click green bubble');
            } else {
                $('.inside_customNotificationDot').remove();
                $('#inside_genericTab').removeClass('animateTabIcon');
                $('.inside_customNotification').addClass('seen');

                customTabHolder.addClass('expanded').find('.inside_chatBubble').attr('tabindex',0);
                updateThemeColor();
                chatEventTracking('Inside : Reactive Chat', 'click', getChatEventLabel());
                setTimeout(function () {
                    if($('#inside_chatTab').is(':visible')) {
                    $('#inside_chatTab').focus();
                    } else if($('#inside_videoTab').is(':visible')) {
                        $('#inside_videoTab').focus();
                    }
                }, 200)

                DraggableTab.adjustPosition();
            }
        }

        if(!useNewDesign && !customTabHolder.hasClass('stopAnimation')) {
            customTabHolder.addClass('stopAnimation');
        }

        return false;
    }

    function setPrechatSettings(type) {
        try {
            insideFrontInterface.chat.settings.preChat.startVideoChat = false; // to disable mic permission logic in the core (bug #36668)
            if(type === 'chat') {
                // enable prechat disclaimer for Korean only 
                if(insideFrontInterface.chatSettings.langCode === 'ko') {
                    insideFrontInterface.chat.settings.preChat.enabled = true;
                    insideFrontInterface.chat.settings.preChat.agreeToDisclaimer = true;
                } else {
                    insideFrontInterface.chat.settings.preChat.enabled = false;
                } 
            } else if(type === 'video') {
                insideFrontInterface.chat.settings.preChat.enabled = true;
                insideFrontInterface.chat.settings.preChat.agreeToDisclaimer = false;
            }
            if(typeof insideChatPane !== 'undefined') {
                delete insideChatPane.lastChatOperatorId;
            }
        } catch (e) { }
    }

    function loadInsideChat(callback) {
        $('#inside_genericTab').addClass('animateTabIcon');
        $.inside.front.loadInsideChat();
        _insideGraph.defer(function() {
            $('#inside_genericTab').removeClass('animateTabIcon');
            callback();
          }, function () { 
            if(typeof insideChatPane === "undefined" || typeof insideChatPane.frame === "undefined") {
                return false;
            }
            var customCssLoaded = false;
            var d = insideChatPane.frame.contentDocument;
            for (var i in d.styleSheets) {
                if (d.styleSheets[i].href && d.styleSheets[i].href.search('gucci-custom-prechat.css') > -1) {
                    customCssLoaded =  true;
                }
            }
            return insideChatPane.customized && customCssLoaded && chatDocument; 
        });
    }

    function chatTabClick() {
        if(typeof insideChatPane == "undefined") {
            $('#inside_chatTab').addClass('loading');
            loadInsideChat(chatTabClick);
            return;
        }
        $('#inside_chatTab').removeClass('loading');

        $('.inside_customNotification').addClass('slide-out-right');
        setTimeout(function() {
            $('.inside_customNotification, .inside_customNotificationDot').remove();
            $('#inside_genericTab').removeClass('animateTabIcon');
        }, 500);
        customTabHolder.removeClass('expanded').find('.inside_chatBubble').removeAttr('tabindex');

        if (!insideChatPane.activeChat) {
            setDepartment('Client Advisor');
        }

        setPrechatSettings('chat');
        sessionStorage.setItem('insidePreChatType', 'chat');
        insideFrontInterface.chatSettings.chatPane.height = initialChatPaneHeight;
        try {
            chatDocument.find('#insideChatPane').attr('prechat-type', 'chat');
            openChatPane();

            if (chatDocument.find('#startANewChatButton').length > 0 || chatDocument.find('#insideChatPane').hasClass('footerHidden')) {
                insideChatPane.startANewChatButtonClick();
            }

            showWelcomeMessage();

            chatDocument.find('#insideChatPane').removeClass('disableChatOnVideoCall');
        } catch (error) { }

        return false;
    }

    function videoTabClick(transferFromChat) {
        if(typeof insideChatPane == "undefined") {
            $('#inside_videoTab').addClass('loading');
            loadInsideChat(videoTabClick);
            return;
        }
        $('#inside_videoTab').removeClass('loading');

        if(insideChatPane.isOpen() && chatDocument.find('#insideChatPane').attr('prechat-type') === 'video') {
            return;
        }

        customTabHolder.removeClass('expanded').find('.inside_chatBubble').removeAttr('tabindex');
        setDepartment('Gucci Live');
        setPrechatSettings('video');
        insideFrontInterface.chatSettings.chatPane.height = 635;
        chatDocument.find('#insideChatPane').attr('prechat-type', 'video').addClass('hideMessages');
        sessionStorage.setItem('insidePreChatType', 'video');
        openChatPane();

        _insideGraph.defer(function () {
            var permissionForm = chatDocument.find('#video_permissionForm');
            var allowMicButton = permissionForm.find('#allowMic');
            var disclaimerText = permissionForm.find('.formText');

            permissionForm.attr('tabindex', 0).find('.inside_chatDisclaimer').attr('tabindex', 0);
            permissionForm.unbind('keydown').keydown(function(e){
                if(e.target.id === 'video_permissionForm' && e.shiftKey && (e.keyCode ? e.keyCode : e.which) === 9) {
                    e.preventDefault();
                }
            });

            chatDocument.find('#insideChatPane').removeClass('hideMessages');
            chatDocument.find('#inside_prechatForm #startYourVisit').unbind('click').click(startYourVisit);

            chatDocument.find('#startYourVisit, #inside_prechatForm .inside_chatDisclaimer').unbind('keydown').keydown(function(e){
                if(!e.shiftKey && (e.keyCode ? e.keyCode : e.which) === 9) {
                    e.preventDefault();
                }
            });
            disclaimerText.html(insideFrontInterface.chatSettings.chatPane.videoChatDisclaimer);

            // #29114
            if (isiOSSafari()) {
                allowMicButton.hide();
                permissionForm.find('#startVideoChat').remove(); // prevent duplicate buttons
                permissionForm.append('<button style="margin-top: 20px !important;" class="insideSubmitButton" id="startVideoChat">' + insideFrontInterface.chat.translate('Accept & Continue') + '</button>');
                permissionForm.find('p, .mediaicon').hide();
                permissionForm.find('h2').text(insideFrontInterface.chat.translate('Please agree to the disclaimer.'));
                permissionForm.find('#startVideoChat').click(startVideoChat);
                disclaimerText.attr('style', 'height: 100% !important;max-height:none !important;');
            } else {
                allowMicButton.show().unbind('click').click(allowMic);
            }
        }, function () {
            return chatDocument.find('#inside_prechatForm #startYourVisit').length > 0;
        });

        if (customTabHolder.hasClass('connecting-video')) {
            chatDocument.find('#insideChatPane').removeClass('hideMessages');
        }

        videoEventTracking('tab_clicked', {
            page: {
                url: document.location.href,
                title: document.title,
                timestamp: (new Date).getTime()
            }
        }); 
        return false;
    }

    function removeTabsClick(e) {
        customTabHolder.hide();
        e.preventDefault();
        e.stopPropagation();
    }
    //#endregion

    //#region custom prechat
    function openChatPane() {
        clearTimeout(openTimeout);
        if (insideChatPane.activeChat != true) resetPrechat();
        try {
            insideFrontInterface.chat.settings.preChat.startVideoChat = false; // to make sure it's not showing the mic permission from core prechat
        } catch (e) { }

        insideChatPane.open();
    }

    var openTimeout;

    _insideGraph.bind("openchat", function () {
        if (typeof chatConsent === 'string' && chatConsent !== 'granted') {
            chatPaneHasOpened();
        }
        else {
            if($('#inside_videoTab').hasClass('loading')) {
                sessionStorage.setItem('insidePreChatType', 'video');
            }
            setPrechatSettings(sessionStorage.getItem('insidePreChatType'));
            setDepartment(sessionStorage.getItem('insidePreChatType') === 'video' ? 'Gucci Live' : 'Client Advisor');

            if(sessionStorage.getItem('insidePreChatType') == "chat" || !sessionStorage.getItem('insidePreChatType')) {
                sessionStorage.setItem('insidePreChatType', 'chat');
                insideFrontInterface.chatSettings.chatPane.height = initialChatPaneHeight;
                chatDocument = $(document.getElementById('insideChatFrame').contentWindow.document);
                chatDocument.find('#insideChatPane').attr('prechat-type', 'chat');
            }
        }
    });

    function chatPaneHasOpened() {
        /* in the case of the chat pane opening from code (not from a chat tab click) resetPrechat needs to be called. */
        openTimeout = setTimeout(function () {
            if (insideChatPane.activeChat != true) resetPrechat();
            if (!insideChatPane.activeChat) {
                showWelcomeMessage();
            }
        }, 100);
    }

    function startYourVisit() {
        insideChatPane.videoChat.checkIfPermissionsAlreadyGranted(startVideoChat, function () {
            var inside_formTitle = chatDocument.find('#inside_prechatForm_form .inside_formTitle');
            inside_formTitle.animate({ 'scrollLeft': inside_formTitle.width() });
            chatDocument.find('#video_permissionForm').css('visibility', 'visible').focus();
        });
    }

    function showDisclaimer() {
        var inside_formTitle = chatDocument.find('#inside_prechatForm_form .inside_formTitle');
        inside_formTitle.animate({ 'scrollLeft': inside_formTitle.width() });
    }

    function allowMic() {
        insideChatPane.videoChat.getUserMedia(startVideoChat, function () {
            var not = insideChatPane.showNotification(insideFrontInterface.chat.settings.videochat_visitor_voiceOnly ? "There was an error allowing mic." : "There was an error allowing camera & mic.", null, false, true);
            setTimeout(function () {
                not.close();
            }, 3000);
        }, insideFrontInterface.chat.settings.videochat_visitor_voiceOnly ? false : true);

    }

    function startVideoChat() {
        insideFrontInterface.chat.settings.preChat.startVideoChat = true;
        insideFrontInterface.chat.settings.preChat.agreeToDisclaimer = false;
        insidePreChatForm.setMediaPermissions(true);
        chatDocument.find('#video_permissionForm').css('visibility', 'hidden');

        const prechatButton = chatDocument.find('#inside_prechatForm_form form > button');
        if(insideFrontInterface.chatInProgress) { // transfer to video channel 
            acceptVideoTransfer();
        } else { // start video from pre-chat
            prechatButton.click();
        }

        customTabHolder.addClass('connecting-video');
        chatDocument.find('#insideChatPane').addClass('connecting-video');
        chatDocument.find('.broadcastExpiryMsg, .welcomeGreeting').hide();

        _insideGraph.defer(function() {
            const queueMessage = chatDocument.find('#notifications .queue .content').attr('tabindex', 0);
            queueMessage.keydown(function() {
                if(e.keyCode == 9) {
                    chatDocument.find('#insideChatPaneButtons [role="button"]:visible:first').focus();
                }
            });
            setTimeout(function () {
                queueMessage.focus();
            }, 100);
        }, function() {
            return chatDocument.find('#notifications .queue').length;
        })
    }

    function acceptVideoTransfer() {
        resetPrechat();
        insideAPI.post("/api/visitor/set_flag", { flag: "chatinprogress", value: false });
        insideAPI.post("/api/visitor/set_flag", { flag: "videoinprogress", value: true });
        setTimeout(function (params) {
            // set timeout to make sure the flag is updated
            insideAPI.post("api/videochat/acceptVideoTransfer", { conversationId: insideFrontInterface.currentChatId });
            insideFrontInterface.videoChatRequested = true;
        }, 500);
        
        setTimeout(function (params) {
            insideChatPane.showNotification(insideFrontInterface.chatSettings.chatPane.queueVideoOnlyMessage, "queue", false, false, true);
        }, 1000);
    }

    //#endregion

}(_insideGraph.jQuery);