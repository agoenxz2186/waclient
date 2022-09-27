const {Client, LocalAuth} = require('whatsapp-web.js');
const mysql = require('mysql');
const { MessageMedia } = require('whatsapp-web.js/src/structures');

var client = new Client();
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
console.log('create pool');
var conn = mysql.createPool(require('./koneksidb.json'));

let deviceID = parseInt( `${process.argv[2] ?? '1'}`); 
var state = 0;
var exitapp = 0;
console.log('hello');
console.log('device id ', deviceID);
conn.query("REPLACE INTO devices SET ? ", [{
    device_id: deviceID,
    state: state, 
    created_at: new Date(),
    logout:0
}, deviceID], (err,res,field)=>{
        console.log('isi err: ',err);
});

function initWA(){
    client = new Client({
        puppeteer: { 
            executablePath: '/usr/bin/google-chrome',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', ]
        },
        authStrategy: new LocalAuth({
            clientId: `wa-${deviceID}`,
            dataPath: `./auth-${deviceID}`
        })
    });

    client.on('qr', (qr)=>{
        state = 1;
        console.log('QR = ', qr);
        conn.query('UPDATE devices SET ? WHERE device_id = ?', [
            {qrcode:qr, state: state,  updated_at: new Date(), logout:0}, deviceID
        ])
    });

    client.on('ready', ()=>{
        state = 2;
        conn.query('UPDATE devices SET ? WHERE device_id = ?', [
            {qrcode:'', state: state,  updated_at: new Date(), logout:0}, deviceID
        ])
        console.log('WA READY');
    });

    client.on('message', async(msg)=>{
      //  console.log('income : ', msg);
        var media = null;
        if(msg.hasMedia){
            media = await msg.downloadMedia();
        }
        conn.query("INSERT INTO inbox SET ?", {
            msg_id: msg.id.id,
            msg_from: msg.from,
            msg_to: msg.to,
            msg_value: msg.type === 'chat' ? msg.body : '',
            msg_media: msg.type !== 'chat' ? media.data : '',
            msg_mime: msg.type !== 'chat' ? media.mimetype : '',
            created_at: new Date()
        }, (err, res)=>{
          //  console.log('message incomde error ', err);
        });
        
        let nomor = msg.to.substring(0, msg.to.length-5);
        conn.query('UPDATE devices SET ? WHERE device_id= ? ', [ {nomorwa:nomor}, deviceID ]);

    });

    client.on('message_ack', (msg, ack)=>{
        conn.query('UPDATE sentitems SET ? WHERE msg_id= ? ', [
            {ack: ack, updated_at: new Date()}, msg.id.id
        ], (Err,res)=>{
          //  console.log('erro msg ack : ',Err);
        });
    });

    client.on('disconnected', (reason)=>{
        state = -1;
        conn.query('UPDATE devices SET ? WHERE device_id = ?', [
            {qrcode: '', state: state, updated_at: new Date()}, deviceID
        ])
        
        console.log('WA DISCONNECTED');
    });

    client.initialize();

}

async function typing(nomor){
    try{
        let chat = await client.getChatById(nomor);
        await chat.sendStateTyping();
        await sleep(Math.random() * (1000 - 100) + 100);
        await chat.clearState();
    }catch(e){
        console.log('erro rtyping', e);
    }  
}

function nomorWA(nomor){
    var ret = nomor.substring(0);
    if(nomor.substring(0,1) === '0'){
        ret = '62' + nomor.substring(1);
    }else if(nomor.substring(0,1) === '+'){
        ret = nomor.substring(1);
    }
    if( ret.substring( ret.length-5 ) !== '@c.us' ){
        ret = ret + '@c.us';
    }
    
    return ret;
}

async function sendMsg(msg){
    var media = msg.msg_media ?? '';
    var mime = msg.msg_mime ?? '';
    var isimage = mime.toLowerCase().indexOf('image') >= 0;
    var filename = msg.msg_filename ?? '';
    var msOptions = {};

    var nomortujuan = nomorWA( msg.msg_to ); 
    await typing(nomortujuan);

    try{
        if(media.length > 512 && mime.length > 5){
            let m = new MessageMedia(mime, media, filename);;
            msOptions = {
                media: m,
                sendMediaAsDocument: isimage ? false : true        
            }; 
        }
        return await client.sendMessage(nomortujuan, msg.msg_value, msOptions);
    }catch(E){
        console.log('ada salah sendmsg: ', E);
    }
    return null;
}

function cekLogout(){
    conn.query("SELECT * FROM devices WHERE device_id= ? ", [deviceID], (err,res)=>{
        if(err)return;
        if(res[0].logout == 1){
            client.logout().then(()=>{
                state = 0;
            });
        }
    });
}

function updateDeviceActivity(){ 
    conn.query("UPDATE devices SET ? WHERE device_id = ?", [
        {updated_at: new Date()}, deviceID
    ]);
}

function saveSentItems(retmsg, msg){
    if(retmsg !== null){
                        
        conn.query("INSERT sentitems SET ?", {
            msg_id: retmsg.id.id,
            msg_from: retmsg.from,
            msg_to: retmsg.to,
            msg_value: msg.msg_value,
            msg_time: msg.msg_time,
            msg_media: msg.msg_media,
            msg_mime: msg.msg_mime,
            msg_filename: msg.msg_filename,
            ack: retmsg.ack,
            created_at: new Date()
        });
        conn.query('DELETE FROM outbox WHERE id=?', [msg.id]);
        
        let nomor = retmsg.from.substring(0, retmsg.from.length-5);
        conn.query('UPDATE devices SET ? WHERE device_id= ? ', [ {nomorwa: nomor, updated_at: new Date()}, deviceID ]);
    }
}

async function proses(){
    initWA();
    var wait = false;
    do{
        await sleep(6000); 
        if( state == 2){
            
            wait = true;
            conn.query("SELECT * FROM outbox WHERE ack <= 0 AND (msg_from = ? OR msg_from IS NULL)   ORDER BY created_at DESC LIMIT 10" , [deviceID], async(err,result, field)=>{
                if(err){
                    wait=false;
                    return;
                }
                
                for(var n in result){
                    let msg = result[n]; 
                    let retmsg = await sendMsg(msg); 
                    saveSentItems(retmsg, msg); 

                }
                await sleep(500);
                wait = false;
            });

            while(wait){
                await sleep(500);
            }

            updateDeviceActivity();
            await sleep(500);
            cekLogout();
           
        }else if(state == -1){
            try{
                await client.destroy();
            }catch(e){}

            initWA();
        }
    }while(exitapp != 1);
}

proses();